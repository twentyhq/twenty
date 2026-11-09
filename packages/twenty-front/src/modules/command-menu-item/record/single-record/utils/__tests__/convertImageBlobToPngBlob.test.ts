import { convertImageBlobToPngBlob } from '@/command-menu-item/record/single-record/utils/convertImageBlobToPngBlob';

const IMAGE_OBJECT_URL = 'blob:source-image';

const mockDecodedImageSize = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  jest
    .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
    .mockReturnValue(width);
  jest
    .spyOn(HTMLImageElement.prototype, 'naturalHeight', 'get')
    .mockReturnValue(height);
};

describe('convertImageBlobToPngBlob', () => {
  const createObjectUrlMock = jest.fn(() => IMAGE_OBJECT_URL);
  const revokeObjectUrlMock = jest.fn();
  const decodeMock = jest.fn();
  const drawImageMock = jest.fn();
  const toBlobMock = jest.fn();
  const getContextMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    URL.createObjectURL = createObjectUrlMock;
    URL.revokeObjectURL = revokeObjectUrlMock;
    HTMLImageElement.prototype.decode = decodeMock;
    HTMLCanvasElement.prototype.getContext = getContextMock;
    HTMLCanvasElement.prototype.toBlob = toBlobMock;

    decodeMock.mockResolvedValue(undefined);
    getContextMock.mockReturnValue({ drawImage: drawImageMock });
    toBlobMock.mockImplementation((callback: BlobCallback, type?: string) =>
      callback(new Blob([''], { type })),
    );
    mockDecodedImageSize({ width: 40, height: 20 });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should draw the decoded image and export it as png', async () => {
    const webpBlob = new Blob([''], { type: 'image/webp' });

    const pngBlob = await convertImageBlobToPngBlob(webpBlob);

    expect(pngBlob?.type).toBe('image/png');
    expect(createObjectUrlMock).toHaveBeenCalledTimes(1);
    expect(createObjectUrlMock).toHaveBeenCalledWith(webpBlob);
    expect(decodeMock).toHaveBeenCalledTimes(1);
    expect(drawImageMock).toHaveBeenCalledTimes(1);
    expect(drawImageMock).toHaveBeenCalledWith(
      expect.any(HTMLImageElement),
      0,
      0,
    );
    expect(toBlobMock).toHaveBeenCalledTimes(1);
    expect(toBlobMock).toHaveBeenCalledWith(expect.any(Function), 'image/png');
    expect(revokeObjectUrlMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlMock).toHaveBeenCalledWith(IMAGE_OBJECT_URL);
  });

  it('should return undefined when the image cannot be decoded', async () => {
    decodeMock.mockRejectedValue(new Error('Unsupported image'));

    expect(
      await convertImageBlobToPngBlob(new Blob([''], { type: 'text/plain' })),
    ).toBeUndefined();
    expect(drawImageMock).not.toHaveBeenCalled();
    expect(revokeObjectUrlMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlMock).toHaveBeenCalledWith(IMAGE_OBJECT_URL);
  });

  it('should return undefined for images without a size', async () => {
    mockDecodedImageSize({ width: 0, height: 0 });

    expect(
      await convertImageBlobToPngBlob(
        new Blob([''], { type: 'image/svg+xml' }),
      ),
    ).toBeUndefined();
    expect(drawImageMock).not.toHaveBeenCalled();
    expect(revokeObjectUrlMock).toHaveBeenCalledTimes(1);
  });

  it('should return undefined when the canvas cannot export png', async () => {
    toBlobMock.mockImplementation((callback: BlobCallback) => callback(null));

    expect(
      await convertImageBlobToPngBlob(new Blob([''], { type: 'image/gif' })),
    ).toBeUndefined();
    expect(toBlobMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlMock).toHaveBeenCalledTimes(1);
  });
});
