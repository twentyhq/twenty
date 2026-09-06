import { FileUploadException } from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { decodeBase64FileContentOrThrow } from 'src/engine/core-modules/file/utils/decode-base64-file-content.util';

describe('decodeBase64FileContentOrThrow', () => {
  it('should decode standard base64', () => {
    expect(
      decodeBase64FileContentOrThrow(Buffer.from('hello').toString('base64')),
    ).toEqual(Buffer.from('hello'));
  });

  it('should decode a data URL payload', () => {
    expect(
      decodeBase64FileContentOrThrow(
        `data:text/plain;base64,${Buffer.from('hello').toString('base64')}`,
      ).toString('utf8'),
    ).toBe('hello');
  });

  it('should reject empty content', () => {
    expect(() => decodeBase64FileContentOrThrow('   ')).toThrow(
      FileUploadException,
    );
  });

  it('should reject invalid base64', () => {
    expect(() => decodeBase64FileContentOrThrow('not base64!!')).toThrow(
      FileUploadException,
    );
  });

  it('should accept a padded payload whose decoded size equals the max', () => {
    expect(
      decodeBase64FileContentOrThrow(Buffer.from('a').toString('base64'), 1),
    ).toEqual(Buffer.from('a'));
  });

  it('should reject content larger than the max decoded size', () => {
    expect(() =>
      decodeBase64FileContentOrThrow(
        Buffer.from('hello').toString('base64'),
        2,
      ),
    ).toThrow(FileUploadException);
  });
});
