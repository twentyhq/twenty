import { createSdkClientModuleBlobUrls } from '../createSdkClientModuleBlobUrls';

describe('createSdkClientModuleBlobUrls', () => {
  const createObjectUrlMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    createObjectUrlMock.mockImplementation(
      (blob: Blob) => `blob:mock/${(blob as Blob).size}`,
    );
    global.URL.createObjectURL =
      createObjectUrlMock as unknown as typeof URL.createObjectURL;
  });

  it('mints a blob url for each sdk client module source', () => {
    const blobUrls = createSdkClientModuleBlobUrls({
      core: 'export const core = 1;',
      metadata: 'export const metadata = 2;',
    });

    expect(createObjectUrlMock).toHaveBeenCalledTimes(2);
    expect(blobUrls.core).toMatch(/^blob:mock\//);
    expect(blobUrls.metadata).toMatch(/^blob:mock\//);
    expect(blobUrls.core).not.toEqual(blobUrls.metadata);
  });
});
