import { downloadFile } from '@/activities/files/utils/downloadFile';
import { saveAs } from 'file-saver';

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

const mockBlob = new Blob(['test content'], { type: 'application/pdf' });

global.fetch = jest.fn(() =>
  Promise.resolve({
    status: 200,
    blob: () => Promise.resolve(mockBlob),
  } as unknown as Response),
);

describe('downloadFile', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should download a file', async () => {
    await downloadFile('url/to/file.pdf', 'file.pdf');

    expect(fetch).toHaveBeenCalledWith('url/to/file.pdf');
    expect(saveAs).toHaveBeenCalledWith(mockBlob, 'file.pdf');
  });

  it('should reject when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 404,
      blob: () => Promise.resolve(mockBlob),
    });

    await expect(downloadFile('url/to/file.pdf', 'file.pdf')).rejects.toBe(
      'Failed downloading file',
    );
  });
});
