import { convertImageBlobToPngBlob } from '@/advanced-text-editor/utils/convertImageBlobToPngBlob';
import { fetchPdfImageBlob } from '@/advanced-text-editor/utils/fetchPdfImageBlob';

jest.mock('@/advanced-text-editor/utils/convertImageBlobToPngBlob');

const convertImageBlobToPngBlobMock = jest.mocked(convertImageBlobToPngBlob);

const IMAGE_URL = 'https://example.com/image';
const FETCH_OPTIONS = { mode: 'cors', credentials: 'omit' };

const buildImageResponse = (imageBlob: Blob) => ({
  ok: true,
  blob: async () => imageBlob,
});

describe('fetchPdfImageBlob', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
  });

  it('should return png and jpeg images as they are', async () => {
    const jpegBlob = new Blob([''], { type: 'image/jpeg' });

    fetchMock.mockResolvedValue(buildImageResponse(jpegBlob));

    expect(await fetchPdfImageBlob(IMAGE_URL)).toBe(jpegBlob);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(IMAGE_URL, FETCH_OPTIONS);
    expect(convertImageBlobToPngBlobMock).not.toHaveBeenCalled();
  });

  it('should convert other image types to png', async () => {
    const webpBlob = new Blob([''], { type: 'image/webp' });
    const convertedPngBlob = new Blob([''], { type: 'image/png' });

    fetchMock.mockResolvedValue(buildImageResponse(webpBlob));
    convertImageBlobToPngBlobMock.mockResolvedValue(convertedPngBlob);

    expect(await fetchPdfImageBlob(IMAGE_URL)).toBe(convertedPngBlob);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(IMAGE_URL, FETCH_OPTIONS);
    expect(convertImageBlobToPngBlobMock).toHaveBeenCalledTimes(1);
    expect(convertImageBlobToPngBlobMock).toHaveBeenCalledWith(webpBlob);
  });

  it('should skip images that fail to load', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    expect(await fetchPdfImageBlob(IMAGE_URL)).toBeUndefined();
    expect(await fetchPdfImageBlob(IMAGE_URL)).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(1, IMAGE_URL, FETCH_OPTIONS);
    expect(fetchMock).toHaveBeenNthCalledWith(2, IMAGE_URL, FETCH_OPTIONS);
    expect(convertImageBlobToPngBlobMock).not.toHaveBeenCalled();
  });
});
