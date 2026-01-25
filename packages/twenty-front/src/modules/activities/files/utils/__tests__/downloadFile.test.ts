import { vi } from 'vitest';
import { downloadFile } from '@/activities/files/utils/downloadFile';

global.fetch = vi.fn(() =>
  Promise.resolve({
    status: 200,
    blob: vi.fn(),
  } as unknown as Response),
);

window.URL.createObjectURL = vi.fn(() => 'mock-url');
window.URL.revokeObjectURL = vi.fn();

// FIXME: jest is behaving weirdly here, it's not finding the element
// Also the document's innerHTML is empty
// `global.fetch` and `window.fetch` are also undefined
describe.skip('downloadFile', () => {
  it('should download a file', () => {
    downloadFile('url/to/file.pdf', 'file.pdf');

    expect(fetch).toHaveBeenCalledWith('url/to/file.pdf');

    const link = document.querySelector(
      'a[href="mock-url"][download="file.pdf"]',
    );

    expect(link).not.toBeNull();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(link?.style?.display).toBe('none');

    expect(link).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();
  });
});
