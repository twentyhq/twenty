import bytes from 'bytes';

import { settings } from 'src/engine/constants/settings';
import { FileUploadException } from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { assertDirectUploadSizeOrThrow } from 'src/engine/core-modules/file/file-upload/utils/assert-direct-upload-size-or-throw.util';

describe('assertDirectUploadSizeOrThrow', () => {
  const maxFileSize = bytes(settings.storage.maxDirectUploadFileSize) ?? 0;

  it('should accept a size at the limit', () => {
    expect(() => assertDirectUploadSizeOrThrow(maxFileSize)).not.toThrow();
  });

  it.each([{ size: maxFileSize + 1 }, { size: 0 }, { size: 1.5 }])(
    'should reject a size of $size',
    ({ size }) => {
      expect(() => assertDirectUploadSizeOrThrow(size)).toThrow(
        FileUploadException,
      );
    },
  );
});
