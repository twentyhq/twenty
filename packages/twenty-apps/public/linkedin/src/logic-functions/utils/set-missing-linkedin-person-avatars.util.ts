import { isNonEmptyArray } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { LINKEDIN_AVATAR_DOWNLOAD_TIMEOUT_MILLISECONDS } from 'src/constants/linkedin-avatar-download-timeout-milliseconds.constant';
import { LINKEDIN_AVATAR_MAX_SIZE_BYTES } from 'src/constants/linkedin-avatar-max-size-bytes.constant';

type PersonAvatarRecord = {
  id: string;
  avatarFile?: { fileId: string }[] | null;
};

type LinkedinPersonAvatar = {
  personId: string;
  pictureUrl: string;
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

const downloadLinkedinPicture = async (
  pictureUrl: string,
): Promise<{ content: Buffer; mimeType: string }> => {
  const response = await fetch(pictureUrl, {
    signal: AbortSignal.timeout(LINKEDIN_AVATAR_DOWNLOAD_TIMEOUT_MILLISECONDS),
  });

  if (!response.ok) {
    throw new Error(`download failed with status ${response.status}`);
  }

  const mimeType = response.headers.get('content-type')?.split(';')[0] ?? '';

  if (!mimeType.startsWith('image/')) {
    throw new Error(`unexpected content type ${mimeType}`);
  }

  const content = Buffer.from(await response.arrayBuffer());

  if (content.byteLength > LINKEDIN_AVATAR_MAX_SIZE_BYTES) {
    throw new Error(
      `picture is larger than ${LINKEDIN_AVATAR_MAX_SIZE_BYTES} bytes`,
    );
  }

  return { content, mimeType };
};

const setPersonAvatar = async ({
  personId,
  pictureUrl,
}: LinkedinPersonAvatar): Promise<void> => {
  const { content, mimeType } = await downloadLinkedinPicture(pictureUrl);
  const filename = `linkedin-avatar.${mimeType.replace('image/', '').replace('jpeg', 'jpg')}`;

  const uploadedFile = await new MetadataApiClient({
    runAs: 'application',
  }).uploadFile({
    fileBuffer: content,
    filename,
    fieldMetadataUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields.avatarFile
        .universalIdentifier,
  });

  await new CoreApiClient({ runAs: 'application' }).mutation({
    updatePerson: {
      __args: {
        id: personId,
        data: { avatarFile: [{ fileId: uploadedFile.id, label: filename }] },
      },
      id: true,
    },
  });

  console.log(`[linkedin] set the LinkedIn avatar of person ${personId}`);
};

export const setMissingLinkedinPersonAvatars = async (
  avatars: LinkedinPersonAvatar[],
): Promise<void> => {
  if (avatars.length === 0) {
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

      personIdsWithoutAvatar.delete(avatar.personId);

      try {
        await setPersonAvatar(avatar);
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
