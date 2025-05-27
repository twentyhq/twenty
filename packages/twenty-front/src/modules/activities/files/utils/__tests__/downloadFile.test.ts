import { downloadFile } from '../downloadFile';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    status: 200,
    blob: jest.fn(),
  } as unknown as Response),
);

window.URL.createObjectURL = jest.fn(() => 'mock-url');
window.URL.revokeObjectURL = jest.fn();

// FIXME: jest is behaving weirdly here, it's not finding the element
// Also the document's innerHTML is empty
// `global.fetch` and `window.fetch` are also undefined
describe.skip('downloadFile', () => {
  it('should download a file', () => {
    // Call downloadFile
    downloadFile('url/to/file.pdf', 'file.pdf');

    // Assert on fetch
    expect(fetch).toHaveBeenCalledWith('url/to/file.pdf');

    // Assert on element creation
    const link = document.querySelector(
      'a[href="mock-url"][download="file.pdf"]',
    );

    expect(link).not.toBeNull();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(link?.style?.display).toBe('none');

    // Assert on element click
    expect(link).toHaveBeenCalledTimes(1);

    // Clean up mocks
    jest.clearAllMocks();
  });
});
