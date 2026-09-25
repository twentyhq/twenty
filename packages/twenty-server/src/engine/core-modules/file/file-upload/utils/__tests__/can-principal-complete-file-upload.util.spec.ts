import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { canPrincipalCompleteFileUpload } from 'src/engine/core-modules/file/file-upload/utils/can-principal-complete-file-upload.util';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';

describe('canPrincipalCompleteFileUpload', () => {
  const initiator = {
    applicationId: 'application-a',
    userWorkspaceId: 'user-workspace-1',
    apiKeyId: null,
  };

  const buildFile = ({
    status,
    uploadPrincipal,
  }: {
    status: FileEntity['status'];
    uploadPrincipal?: typeof initiator;
  }) =>
    ({
      status,
      settings: { isTemporaryFile: true, toDelete: false, uploadPrincipal },
    }) as Pick<FileEntity, 'settings' | 'status'>;

  it('should let the initiating principal complete its upload', () => {
    expect(
      canPrincipalCompleteFileUpload({
        file: buildFile({
          status: FILE_STATUS.PENDING,
          uploadPrincipal: initiator,
        }),
        principal: initiator,
      }),
    ).toBe(true);
  });

  it('should refuse another principal', () => {
    expect(
      canPrincipalCompleteFileUpload({
        file: buildFile({
          status: FILE_STATUS.UPLOADED,
          uploadPrincipal: initiator,
        }),
        principal: { ...initiator, applicationId: 'application-b' },
      }),
    ).toBe(false);
  });

  it('should let any principal complete a pending upload stored without an initiator', () => {
    expect(
      canPrincipalCompleteFileUpload({
        file: buildFile({ status: FILE_STATUS.PENDING }),
        principal: initiator,
      }),
    ).toBe(true);
  });

  it('should refuse to re-sign an uploaded file stored without an initiator', () => {
    expect(
      canPrincipalCompleteFileUpload({
        file: buildFile({ status: FILE_STATUS.UPLOADED }),
        principal: initiator,
      }),
    ).toBe(false);
  });
});
