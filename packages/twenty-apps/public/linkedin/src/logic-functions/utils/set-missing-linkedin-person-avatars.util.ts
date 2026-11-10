import { isNonEmptyArray } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { LINKEDIN_AVATAR_REQUEST_TIMEOUT_MILLISECONDS } from 'src/constants/linkedin-avatar-request-timeout-milliseconds.constant';
import { LINKEDIN_AVATAR_MAX_SIZE_BYTES } from 'src/constants/linkedin-avatar-max-size-bytes.constant';
import { PERSON_AVATAR_FILE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/person-avatar-file-field-universal-identifier.constant';

type PersonAvatarRecord = {
  id: string;
  avatarFile?: { fileId: string }[] | null;
};

type LinkedinPersonAvatar = {
  personId: string;
  pictureUrl: string;
};

const PERSON_WITHOUT_AVATAR_FILTER = {
  or: [{ avatarFile: { is: 'NULL' as const } }, { avatarFile: { like: '[]' } }],
};

const findPersonIdsWithoutAvatar = async (
  personIds: string[],
): Promise<Set<string>> => {
  const { people } = await new CoreApiClient({ runAs: 'application' }).query({
    people: {
      __args: { filter: { id: { in: personIds } }, first: personIds.length },
      edges: { node: { id: true, avatarFile: { fileId: true } } },
    },
  });

  return new Set(
    (people?.edges ?? [])
      .map((edge: { node: PersonAvatarRecord }) => edge.node)
      .filter(
        (person: PersonAvatarRecord) =>
          !isNonEmptyArray(person.avatarFile ?? []),
      )
      .map((person: PersonAvatarRecord) => person.id),
  );
};

const readBoundedBody = async (
  body: ReadableStream<Uint8Array>,
): Promise<Buffer> => {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let sizeBytes = 0;
  let readResult = await reader.read();

  while (!readResult.done) {
    sizeBytes += readResult.value.byteLength;

    if (sizeBytes > LINKEDIN_AVATAR_MAX_SIZE_BYTES) {
      await reader.cancel();

      throw new Error(
        `picture is larger than ${LINKEDIN_AVATAR_MAX_SIZE_BYTES} bytes`,
      );
    }

    chunks.push(readResult.value);
    readResult = await reader.read();
  }

  return Buffer.concat(chunks);
};

const getRemainingTimeSignal = (deadlineAtMs: number): AbortSignal =>
  AbortSignal.timeout(
    Math.max(
      Math.min(
        LINKEDIN_AVATAR_REQUEST_TIMEOUT_MILLISECONDS,
        deadlineAtMs - Date.now(),
      ),
      1,
    ),
  );

const createDeadlineBoundFetch =
  (deadlineAtMs: number) =>
  (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
    fetch(input, { ...init, signal: getRemainingTimeSignal(deadlineAtMs) });

const downloadLinkedinPicture = async ({
  pictureUrl,
  deadlineAtMs,
}: {
  pictureUrl: string;
  deadlineAtMs: number;
}): Promise<{ content: Buffer; mimeType: string }> => {
  const response = await fetch(pictureUrl, {
    signal: getRemainingTimeSignal(deadlineAtMs),
  });

  if (!response.ok || response.body === null) {
    throw new Error(`download failed with status ${response.status}`);
  }

  const mimeType = response.headers.get('content-type')?.split(';')[0] ?? '';

  if (!mimeType.startsWith('image/')) {
    await response.body.cancel();

    throw new Error(`unexpected content type ${mimeType}`);
  }

  return { content: await readBoundedBody(response.body), mimeType };
};

// Calls the upload mutations directly: the runtime client injected by the
// server may not expose the same uploadFile helper signature as the build SDK.
const uploadAvatarFile = async ({
  content,
  filename,
  deadlineAtMs,
}: {
  content: Buffer;
  filename: string;
  deadlineAtMs: number;
}): Promise<string> => {
  if (Date.now() >= deadlineAtMs) {
    throw new Error('job deadline reached before the upload');
  }

  const metadataClient = new MetadataApiClient({
    runAs: 'application',
    fetch: createDeadlineBoundFetch(deadlineAtMs),
  });

  const { createFileUpload } = await metadataClient.mutation({
    createFileUpload: {
      __args: {
        filename,
        size: content.byteLength,
        fileFolder: 'FilesField',
        fieldMetadataUniversalIdentifier:
          PERSON_AVATAR_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      },
      fileId: true,
      uploadUrl: true,
      contentType: true,
    },
  });

  const uploadResponse = await fetch(createFileUpload.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': createFileUpload.contentType },
    body: new Uint8Array(content),
    signal: getRemainingTimeSignal(deadlineAtMs),
  });

  if (!uploadResponse.ok) {
    throw new Error(`upload failed with status ${uploadResponse.status}`);
  }

  const { completeFileUpload } = await metadataClient.mutation({
    completeFileUpload: {
      __args: { fileId: createFileUpload.fileId },
      id: true,
    },
  });

  return completeFileUpload.id;
};

const setPersonAvatar = async ({
  personId,
  pictureUrl,
  deadlineAtMs,
}: LinkedinPersonAvatar & { deadlineAtMs: number }): Promise<void> => {
  const { content, mimeType } = await downloadLinkedinPicture({
    pictureUrl,
    deadlineAtMs,
  });
  const filename = `linkedin-avatar.${mimeType.replace('image/', '').replace('jpeg', 'jpg')}`;

  const fileId = await uploadAvatarFile({
    content,
    filename,
    deadlineAtMs,
  });

  const { updatePeople } = await new CoreApiClient({
    runAs: 'application',
    fetch: createDeadlineBoundFetch(deadlineAtMs),
  }).mutation({
    updatePeople: {
      __args: {
        filter: {
          and: [{ id: { eq: personId } }, PERSON_WITHOUT_AVATAR_FILTER],
        },
        data: { avatarFile: [{ fileId, label: filename }] },
      },
      id: true,
    },
  });

  if ((updatePeople ?? []).length === 0) {
    console.log(
      `[linkedin] person ${personId} got an avatar during the sync, LinkedIn picture not set`,
    );

    return;
  }

  console.log(`[linkedin] set the LinkedIn avatar of person ${personId}`);
};

export const setMissingLinkedinPersonAvatars = async ({
  avatars,
  deadlineAtMs,
}: {
  avatars: LinkedinPersonAvatar[];
  deadlineAtMs: number;
}): Promise<void> => {
  if (avatars.length === 0 || Date.now() >= deadlineAtMs) {
    return;
  }

  try {
    const personIdsWithoutAvatar = await findPersonIdsWithoutAvatar([
      ...new Set(avatars.map((avatar) => avatar.personId)),
    ]);

    for (const avatar of avatars) {
      if (!personIdsWithoutAvatar.has(avatar.personId)) {
        continue;
      }

      if (Date.now() >= deadlineAtMs) {
        console.warn(
          '[linkedin] avatar import reached the job deadline, remaining avatars skipped',
        );

        return;
      }

      personIdsWithoutAvatar.delete(avatar.personId);

      try {
        await setPersonAvatar({ ...avatar, deadlineAtMs });
      } catch (error) {
        console.warn(
          `[linkedin] could not set the avatar of person ${avatar.personId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  } catch (error) {
    console.warn(
      `[linkedin] could not set missing person avatars: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
