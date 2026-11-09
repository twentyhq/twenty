import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  mutation: vi.fn(),
  uploadFile: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = mocks.query;
    mutation = mocks.mutation;
  },
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    uploadFile = mocks.uploadFile;
  },
}));

const { setMissingLinkedinPersonAvatars } =
  await import('src/logic-functions/utils/set-missing-linkedin-person-avatars.util');

const PICTURE_URL = 'https://media.licdn.com/priya.jpg';

const mockPeople = (
  people: { id: string; avatarFile: { fileId: string }[] | null }[],
) =>
  mocks.query.mockResolvedValue({
    people: { edges: people.map((node) => ({ node })) },
  });

const mockPictureResponse = ({
  ok = true,
  contentType = 'image/jpeg',
}: { ok?: boolean; contentType?: string } = {}) =>
  mocks.fetch.mockResolvedValue({
    ok,
    status: ok ? 200 : 403,
    headers: new Headers({ 'content-type': contentType }),
    arrayBuffer: async () => new Uint8Array([255, 216, 255]).buffer,
  });

describe('setMissingLinkedinPersonAvatars', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mocks.fetch);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mocks.uploadFile.mockResolvedValue({ id: 'file-id' });
    mocks.mutation.mockResolvedValue({ updatePerson: { id: 'priya-id' } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uploads the LinkedIn picture to a person without avatar', async () => {
    mockPeople([{ id: 'priya-id', avatarFile: [] }]);
    mockPictureResponse();

    await setMissingLinkedinPersonAvatars([
      { personId: 'priya-id', pictureUrl: PICTURE_URL },
    ]);

    expect(mocks.fetch).toHaveBeenCalledWith(PICTURE_URL, expect.anything());
    expect(mocks.uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({ filename: 'linkedin-avatar.jpg' }),
    );
    expect(mocks.mutation.mock.calls[0][0].updatePerson.__args).toEqual({
      id: 'priya-id',
      data: {
        avatarFile: [{ fileId: 'file-id', label: 'linkedin-avatar.jpg' }],
      },
    });
  });

  it('keeps the avatar a person already has', async () => {
    mockPeople([{ id: 'priya-id', avatarFile: [{ fileId: 'existing' }] }]);

    await setMissingLinkedinPersonAvatars([
      { personId: 'priya-id', pictureUrl: PICTURE_URL },
    ]);

    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.mutation).not.toHaveBeenCalled();
  });

  it('sets the avatar once when a person appears twice', async () => {
    mockPeople([{ id: 'priya-id', avatarFile: null }]);
    mockPictureResponse();

    await setMissingLinkedinPersonAvatars([
      { personId: 'priya-id', pictureUrl: PICTURE_URL },
      { personId: 'priya-id', pictureUrl: PICTURE_URL },
    ]);

    expect(mocks.mutation).toHaveBeenCalledOnce();
  });

  it('does not fail the sync when the picture cannot be downloaded', async () => {
    mockPeople([{ id: 'priya-id', avatarFile: [] }]);
    mockPictureResponse({ ok: false });

    await expect(
      setMissingLinkedinPersonAvatars([
        { personId: 'priya-id', pictureUrl: PICTURE_URL },
      ]),
    ).resolves.toBeUndefined();
    expect(mocks.uploadFile).not.toHaveBeenCalled();
  });

  it('ignores a response that is not an image', async () => {
    mockPeople([{ id: 'priya-id', avatarFile: [] }]);
    mockPictureResponse({ contentType: 'text/html' });

    await setMissingLinkedinPersonAvatars([
      { personId: 'priya-id', pictureUrl: PICTURE_URL },
    ]);

    expect(mocks.uploadFile).not.toHaveBeenCalled();
  });

  it('queries nothing when there is no picture to set', async () => {
    await setMissingLinkedinPersonAvatars([]);

    expect(mocks.query).not.toHaveBeenCalled();
  });
});
