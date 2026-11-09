import { convertImageBlobToPngBlob } from '@/command-menu-item/record/single-record/utils/convertImageBlobToPngBlob';
import { fetchPdfImageObjectUrl } from '@/command-menu-item/record/single-record/utils/fetchPdfImageObjectUrl';

jest.mock(
  '@/command-menu-item/record/single-record/utils/convertImageBlobToPngBlob',
);

const convertImageBlobToPngBlobMock = jest.mocked(convertImageBlobToPngBlob);

const IMAGE_URL = 'https://example.com/image';
const FETCH_OPTIONS = { mode: 'cors', credentials: 'omit' };

const buildImageResponse = (imageBlob: Blob) => ({
  ok: true,
  blob: async () => imageBlob,
});

describe('fetchPdfImageObjectUrl', () => {
  const fetchMock = jest.fn();
  const createObjectUrlMock = jest.fn(() => 'blob:image');

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
    URL.createObjectURL = createObjectUrlMock;
  });

  it('should return an object url for png and jpeg images', async () => {
    const pngBlob = new Blob([''], { type: 'image/png' });

    fetchMock.mockResolvedValue(buildImageResponse(pngBlob));

    expect(await fetchPdfImageObjectUrl(IMAGE_URL)).toBe('blob:image');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(IMAGE_URL, FETCH_OPTIONS);
    expect(createObjectUrlMock).toHaveBeenCalledTimes(1);
    expect(createObjectUrlMock).toHaveBeenCalledWith(pngBlob);
    expect(convertImageBlobToPngBlobMock).not.toHaveBeenCalled();
  });

  it('should convert other image types to png', async () => {
    const webpBlob = new Blob([''], { type: 'image/webp' });
    const convertedPngBlob = new Blob([''], { type: 'image/png' });

    fetchMock.mockResolvedValue(buildImageResponse(webpBlob));
    convertImageBlobToPngBlobMock.mockResolvedValue(convertedPngBlob);

    expect(await fetchPdfImageObjectUrl(IMAGE_URL)).toBe('blob:image');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(IMAGE_URL, FETCH_OPTIONS);
    expect(convertImageBlobToPngBlobMock).toHaveBeenCalledTimes(1);
    expect(convertImageBlobToPngBlobMock).toHaveBeenCalledWith(webpBlob);
    expect(createObjectUrlMock).toHaveBeenCalledTimes(1);
    expect(createObjectUrlMock).toHaveBeenCalledWith(convertedPngBlob);
  });

  it('should skip images that cannot be converted', async () => {
    fetchMock.mockResolvedValue(
      buildImageResponse(new Blob([''], { type: 'application/pdf' })),
    );
    convertImageBlobToPngBlobMock.mockResolvedValue(undefined);

    expect(await fetchPdfImageObjectUrl(IMAGE_URL)).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(convertImageBlobToPngBlobMock).toHaveBeenCalledTimes(1);
    expect(createObjectUrlMock).not.toHaveBeenCalled();
  });

  it('should skip images that fail to load', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    expect(await fetchPdfImageObjectUrl(IMAGE_URL)).toBeUndefined();
    expect(await fetchPdfImageObjectUrl(IMAGE_URL)).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(1, IMAGE_URL, FETCH_OPTIONS);
    expect(fetchMock).toHaveBeenNthCalledWith(2, IMAGE_URL, FETCH_OPTIONS);
    expect(convertImageBlobToPngBlobMock).not.toHaveBeenCalled();
    expect(createObjectUrlMock).not.toHaveBeenCalled();
  });
});
