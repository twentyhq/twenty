import { fetchPdfImageObjectUrl } from '@/command-menu-item/record/single-record/utils/fetchPdfImageObjectUrl';

const IMAGE_URL = 'https://example.com/image';

const buildImageResponse = (type: string) => ({
  ok: true,
  blob: async () => new Blob([''], { type }),
});

describe('fetchPdfImageObjectUrl', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
    URL.createObjectURL = jest.fn(() => 'blob:image');
  });

  it('should return an object url for png and jpeg images', async () => {
    fetchMock.mockResolvedValue(buildImageResponse('image/png'));

    expect(await fetchPdfImageObjectUrl(IMAGE_URL)).toBe('blob:image');
  });

  it('should skip image types the pdf cannot draw', async () => {
    fetchMock.mockResolvedValue(buildImageResponse('image/webp'));

    expect(await fetchPdfImageObjectUrl(IMAGE_URL)).toBeUndefined();
  });

  it('should skip images that fail to load', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    expect(await fetchPdfImageObjectUrl(IMAGE_URL)).toBeUndefined();
    expect(await fetchPdfImageObjectUrl(IMAGE_URL)).toBeUndefined();
  });
});
