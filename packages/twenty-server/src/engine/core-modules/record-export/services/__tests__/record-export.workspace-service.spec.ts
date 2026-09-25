import { Test } from '@nestjs/testing';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { RECORD_EXPORT_DOWNLOAD_TOKEN_TTL_SECONDS } from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';

describe('RecordExportWorkspaceService', () => {
  it('returns an API-relative download path with a token bound to the requester', async () => {
    const jwtWrapperService = {
      signAsyncOrThrow: jest.fn().mockResolvedValue('signed-token'),
    };
    const module = await Test.createTestingModule({
      providers: [
        RecordExportWorkspaceService,
        { provide: JwtWrapperService, useValue: jwtWrapperService },
      ],
    })
      .useMocker(() => ({}))
      .compile();
    const service = module.get(RecordExportWorkspaceService);
    jest.spyOn(service, 'resolveRequester').mockResolvedValue({} as never);
    jest.spyOn(service, 'assertPermissionsUnchanged').mockResolvedValue();
    jest.spyOn(service, 'findOrThrow').mockResolvedValue({} as never);

    const recordExport = {
      id: 'export-id',
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      workspaceMemberId: 'workspace-member-id',
      requestTokenHash: 'request-token-hash',
      permissionsHash: 'permissions-hash',
      filename: 'company.csv',
    };

    await expect(service.getDownloadPath(recordExport)).resolves.toBe(
      '/file/record-export/export-id?token=signed-token',
    );
    expect(jwtWrapperService.signAsyncOrThrow).toHaveBeenCalledWith(
      {
        type: JwtTokenTypeEnum.FILE,
        purpose: 'record-export',
        sub: recordExport.workspaceId,
        workspaceId: recordExport.workspaceId,
        fileId: recordExport.id,
        userWorkspaceId: recordExport.userWorkspaceId,
        workspaceMemberId: recordExport.workspaceMemberId,
        requestTokenHash: recordExport.requestTokenHash,
        permissionsHash: recordExport.permissionsHash,
        filename: recordExport.filename,
      },
      { expiresIn: RECORD_EXPORT_DOWNLOAD_TOKEN_TTL_SECONDS },
    );
    await module.close();
  });
});
