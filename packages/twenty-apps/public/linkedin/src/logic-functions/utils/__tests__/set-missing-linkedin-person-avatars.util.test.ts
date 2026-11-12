import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LINKEDIN_AVATAR_MAX_SIZE_BYTES } from 'src/constants/linkedin-avatar-max-size-bytes.constant';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  mutation: vi.fn(),
  metadataMutation: vi.fn(),
  clientOptions: [] as { fetch?: unknown }[],
  fetch: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    constructor(options: { fetch?: unknown }) {
      mocks.clientOptions.push(options);
    }

    query = mocks.query;
    mutation = mocks.mutation;
  },
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    constructor(options: { fetch?: unknown }) {
      mocks.clientOptions.push(options);
    }

    mutation = mocks.metadataMutation;
  },
}));

const { setMissingLinkedinPersonAvatars } =
  await import('src/logic-functions/utils/set-missing-linkedin-person-avatars.util');

const PICTURE_URL = 'https://media.licdn.com/priya.jpg';

const UPLOAD_URL = 'https://storage.twenty.com/pending-file-id';

const PRIYA_AVATAR = { personId: 'priya-id', pictureUrl: PICTURE_URL };

const setAvatars = (
  avatars = [PRIYA_AVATAR],
  deadlineAtMs = Date.now() + 60_000,
) => setMissingLinkedinPersonAvatars({ avatars, deadlineAtMs });

const mockPeople = (
  people: { id: string; avatarFile: { fileId: string }[] | null }[],
) =>
  mocks.query.mockResolvedValue({
    people: { edges: people.map((node) => ({ node })) },
  });

const buildStream = (chunks: Uint8Array[]) => {
  const cancel = vi.fn();
  let index = 0;

  return {
    cancel,
    stream: new ReadableStream<Uint8Array>({
      pull: (controller) => {
        if (index < chunks.length) {
          controller.enqueue(chunks[index]);
          index += 1;
        } else {
          controller.close();
        }
      },
      cancel,
    }),
  };
};

const mockPictureResponse = ({
  ok = true,
  contentType = 'image/jpeg',
  chunks = [new Uint8Array([255, 216, 255])],
}: {
  ok?: boolean;
  contentType?: string;
  chunks?: Uint8Array[];
} = {}) => {
  const { stream, cancel } = buildStream(chunks);

  mocks.fetch.mockImplementation(async (_url: string, init?: RequestInit) =>
    init?.method === 'PUT'
      ? { ok: true, status: 200 }
      : {
          ok,
          status: ok ? 200 : 403,
          headers: new Headers({ 'content-type': contentType }),
          body: stream,
        },
  );

  return cancel;
};

const getUpdateArgs = () => mocks.mutation.mock.calls[0][0].updatePeople.__args;

describe('setMissingLinkedinPersonAvatars', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.clientOptions.length = 0;
    vi.stubGlobal('fetch', mocks.fetch);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mocks.metadataMutation.mockImplementation(async (input) =>
      'createFileUpload' in input
        ? {
            createFileUpload: {
              fileId: 'pending-file-id',
              uploadUrl: UPLOAD_URL,
              contentType: 'image/jpeg',
            },
          }
        : { completeFileUpload: { id: 'file-id' } },
    );
    mocks.mutation.mockResolvedValue({ updatePeople: [{ id: 'priya-id' }] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uploads the LinkedIn picture to a person without avatar', async () => {
    mockPeople([{ id: 'priya-id', avatarFile: [] }]);
    mockPictureResponse();

    await setAvatars();

    expect(mocks.fetch).toHaveBeenCalledWith(PICTURE_URL, expect.anything());
    expect(
      mocks.metadataMutation.mock.calls[0][0].createFileUpload.__args,
    ).toEqual({
      filename: 'linkedin-avatar.jpg',
      size: 3,
      fileFolder: 'FilesField',
      fieldMetadataUniversalIdentifier: '20202020-a7c9-4e3d-8f1b-2d5a6b7c8e9f',
    });
    expect(mocks.fetch).toHaveBeenCalledWith(
      UPLOAD_URL,
      expect.objectContaining({
        method: 'PUT',
        signal: expect.any(AbortSignal),
      }),
    );
    expect(
      mocks.metadataMutation.mock.calls[1][0].completeFileUpload.__args,
    ).toEqual({ fileId: 'pending-file-id' });
    expect(getUpdateArgs().data).toEqual({
      avatarFile: [{ fileId: 'file-id', label: 'linkedin-avatar.jpg' }],
    });
  });

  it('bounds the upload and update requests by the job deadline', async () => {
    mockPeople([{ id: 'priya-id', avatarFile: [] }]);
    mockPictureResponse();

    await setAvatars();

    const [, metadataClientOptions, updateClientOptions] = mocks.clientOptions;

    expect(metadataClientOptions.fetch).toEqual(expect.any(Function));
    expect(updateClientOptions.fetch).toEqual(expect.any(Function));
  });

  it('only writes the avatar if the person still has none', async () => {
    mockPeople([{ id: 'priya-id', avatarFile: [] }]);
    mockPictureResponse();
    mocks.mutation.mockResolvedValue({ updatePeople: [] });

    await expect(setAvatars()).resolves.toBeUndefined();

    expect(getUpdateArgs().filter).toEqual({
      and: [
        { id: { eq: 'priya-id' } },
        {
          or: [{ avatarFile: { is: 'NULL' } }, { avatarFile: { like: '[]' } }],
        },
      ],
    });
  });

  it('keeps the avatar a person already has', async () => {
    mockPeople([{ id: 'priya-id', avatarFile: [{ fileId: 'existing' }] }]);

    await setAvatars();

    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.mutation).not.toHaveBeenCalled();
  });

  it('sets the avatar once when a person appears twice', async () => {
    mockPeople([{ id: 'priya-id', avatarFile: null }]);
    mockPictureResponse();

    await setAvatars([PRIYA_AVATAR, PRIYA_AVATAR]);

    expect(mocks.mutation).toHaveBeenCalledOnce();
  });

  it('stops reading a picture as soon as it exceeds the size limit', async () => {
    mockPeople([{ id: 'priya-id', avatarFile: [] }]);
    const cancel = mockPictureResponse({
      chunks: [
        new Uint8Array(LINKEDIN_AVATAR_MAX_SIZE_BYTES),
        new Uint8Array(1),
        new Uint8Array(1),
      ],
    });

    await expect(setAvatars()).resolves.toBeUndefined();

    expect(cancel).toHaveBeenCalled();
    expect(mocks.metadataMutation).not.toHaveBeenCalled();
  });

  it('does not fail the sync when the picture cannot be downloaded', async () => {
    mockPeople([{ id: 'priya-id', avatarFile: [] }]);
    mockPictureResponse({ ok: false });

    await expect(setAvatars()).resolves.toBeUndefined();
    expect(mocks.metadataMutation).not.toHaveBeenCalled();
  });

  it('ignores a response that is not an image', async () => {
    mockPeople([{ id: 'priya-id', avatarFile: [] }]);
    mockPictureResponse({ contentType: 'text/html' });

    await setAvatars();

    expect(mocks.metadataMutation).not.toHaveBeenCalled();
  });

  it('does nothing once the job deadline has passed', async () => {
    await setAvatars([PRIYA_AVATAR], Date.now() - 1);

    expect(mocks.query).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('queries nothing when there is no picture to set', async () => {
    await setAvatars([]);

    expect(mocks.query).not.toHaveBeenCalled();
  });
});
