import { createJavaScriptModuleBlobUrl } from '../createJavaScriptModuleBlobUrl';

const originalCreateObjectUrl = URL.createObjectURL;

describe('createJavaScriptModuleBlobUrl', () => {
  afterEach(() => {
    URL.createObjectURL = originalCreateObjectUrl;
  });

  it('should return the object url created for the module source', () => {
    URL.createObjectURL = jest.fn(() => 'blob:mock-url');

    expect(createJavaScriptModuleBlobUrl('export default () => {};')).toBe(
      'blob:mock-url',
    );
  });

  it('should create a javascript blob from the source', () => {
    const createObjectUrlSpy = jest.fn(() => 'blob:mock-url');
    URL.createObjectURL = createObjectUrlSpy;

    createJavaScriptModuleBlobUrl('export default () => {};');

    const [blob] = createObjectUrlSpy.mock.calls[0] as unknown as [Blob];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/javascript');
  });
});
