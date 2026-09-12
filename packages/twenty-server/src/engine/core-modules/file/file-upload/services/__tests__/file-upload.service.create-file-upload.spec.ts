import { FileFolder } from 'twenty-shared/types';

import { MAX_SANITIZABLE_SVG_BYTES } from 'src/engine/core-modules/file/file-upload/constants/max-sanitizable-svg-size.constant';
import { FileUploadExceptionCode } from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';

describe('FileUploadService.createFileUpload', () => {
  const workspaceId = '20202020-0000-4000-8000-000000000001';

  // The oversized SVG guard rejects before reaching any collaborator.
  const buildService = () =>
    new FileUploadService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

  const createUpload = (filename: string, size: number) =>
    buildService().createFileUpload({
      workspaceId,
      filename,
      size,
      fileFolder: FileFolder.FilesField,
      fieldMetadataId: '20202020-0000-4000-8000-000000000002',
    });

  it.each(['logo.svg', 'logo.SVG', 'logo.Svg'])(
    'should refuse an oversized %s before handing out an upload target',
    async (filename) => {
      await expect(
        createUpload(filename, MAX_SANITIZABLE_SVG_BYTES + 1),
      ).rejects.toMatchObject({
        code: FileUploadExceptionCode.FILE_TOO_LARGE,
      });
    },
  );

  it('should not refuse an SVG within the limit', async () => {
    // Reaching a collaborator means the guard let it through, which is what
    // this asserts: the empty mocks make that surface as a TypeError.
    await expect(
      createUpload('logo.svg', MAX_SANITIZABLE_SVG_BYTES),
    ).rejects.not.toMatchObject({
      code: FileUploadExceptionCode.FILE_TOO_LARGE,
    });
  });
});
