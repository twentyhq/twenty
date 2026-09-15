import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
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

  @Mutation(() => RecordExportDTO)
  createRecordExport(
    @Args('input') input: CreateRecordExportInput,
  ): Promise<RecordExportDTO> {
    return this.recordExportWorkspaceService.create(
      input,
      getWorkspaceAuthContext(),
    );
  }

  @Mutation(() => RecordExportDTO)
  retryRecordExport(
    @Args('id', { type: () => UUIDScalarType }) id: string,
  ): Promise<RecordExportDTO> {
    return this.recordExportWorkspaceService.retry(
      id,
      getWorkspaceAuthContext(),
    );
  }

  @Query(() => [RecordExportDTO])
  findManyRecordExports(): Promise<RecordExportDTO[]> {
    return this.recordExportWorkspaceService.findMine(
      getWorkspaceAuthContext(),
    );
  }

  @Mutation(() => String)
  createRecordExportDownloadUrl(
    @Args('id', { type: () => UUIDScalarType }) id: string,
  ): Promise<string> {
    return this.recordExportWorkspaceService.getDownloadUrl(
      id,
      getWorkspaceAuthContext(),
    );
  }
}
