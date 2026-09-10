import bytes from 'bytes';

import { settings } from 'src/engine/constants/settings';
import { FileUploadExceptionCode } from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { assertSizeIsWithinDirectUploadLimit } from 'src/engine/core-modules/file/file-upload/utils/assert-size-is-within-direct-upload-limit.util';

const MAX_DIRECT_UPLOAD_FILE_SIZE = bytes(
  settings.storage.maxDirectUploadFileSize,
) as number;

describe('assertSizeIsWithinDirectUploadLimit', () => {
  it.each([0, -1, 1.5, MAX_DIRECT_UPLOAD_FILE_SIZE + 1])(
    'should reject size %s',
    (size) => {
      expect(() => assertSizeIsWithinDirectUploadLimit(size)).toThrow(
        expect.objectContaining({
          code: FileUploadExceptionCode.FILE_TOO_LARGE,
        }),
      );
    },
  );

  it.each([1, MAX_DIRECT_UPLOAD_FILE_SIZE])('should accept size %s', (size) => {
    expect(() => assertSizeIsWithinDirectUploadLimit(size)).not.toThrow();
  });
});
