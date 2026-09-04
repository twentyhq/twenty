import { FileFolder } from 'twenty-shared/types';

import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { buildPendingUploadResourcePath } from 'src/engine/core-modules/file/file-upload/utils/build-pending-upload-resource-path.util';

describe('buildPendingUploadResourcePath', () => {
  const fileId = '20202020-0000-4000-8000-000000000001';

  it('should keep the final resource path under the prefix', () => {
    expect(
      buildPendingUploadResourcePath({
        fileId,
        resourcePath: 'field-universal-identifier/document.pdf',
      }),
    ).toBe(`.pending/${fileId}/field-universal-identifier/document.pdf`);
  });

  // The presigned PUT targets the quarantine path, so it has to survive the
  // same storage validation as the final path for every folder shape.
  it.each([
    { fileFolder: FileFolder.FilesField, resourcePath: 'field-uid/file.png' },
    { fileFolder: FileFolder.Workflow, resourcePath: 'attachment.pdf' },
    { fileFolder: FileFolder.EmailImage, resourcePath: 'inline-image.png' },
    { fileFolder: FileFolder.Source, resourcePath: 'src/index.ts' },
    { fileFolder: FileFolder.Dependencies, resourcePath: 'yarn.lock' },
  ])(
    'should build a path that validates for $fileFolder',
    ({ fileFolder, resourcePath }) => {
      expect(validateFilePath({ resourcePath, fileFolder })).toEqual({
        isValid: true,
      });

      expect(
        validateFilePath({
          resourcePath: buildPendingUploadResourcePath({
            fileId,
            resourcePath,
          }),
          fileFolder,
        }),
      ).toEqual({ isValid: true });
    },
  );
});
