import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Subscription } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CreateRecordExportInput } from 'src/engine/core-modules/record-export/dtos/create-record-export.input';
import { RecordExportDTO } from 'src/engine/core-modules/record-export/dtos/record-export.dto';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@MetadataResolver()
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.EXPORT_CSV),
)
@UsePipes(ResolverValidationPipe)
export class RecordExportResolver {
  constructor(
    private readonly recordExportWorkspaceService: RecordExportWorkspaceService,
  ) {}

  @Subscription(() => RecordExportDTO, {
    resolve: (payload: RecordExportDTO) => payload,
  })
  exportRecords(
    @Args('input') input: CreateRecordExportInput,
  ): Promise<AsyncIterableIterator<RecordExportDTO>> {
    return this.recordExportWorkspaceService.stream({
      parameters: input,
      authContext: getWorkspaceAuthContext(),
    });
  }
}
