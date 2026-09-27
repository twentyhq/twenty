import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Subscription } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { CreateRecordImportInput } from 'src/engine/core-modules/record-import/dtos/create-record-import.input';
import { RecordImportColumnSamplesDTO } from 'src/engine/core-modules/record-import/dtos/record-import-column-samples.dto';
import { RecordImportPreviewDTO } from 'src/engine/core-modules/record-import/dtos/record-import-preview.dto';
import {
  PrepareRecordImportInput,
  PreviewRecordImportSheetInput,
  RecordImportSessionInput,
  RecordImportVersionedInput,
  SetRecordImportMappingInput,
} from 'src/engine/core-modules/record-import/dtos/record-import-session.input';
import { RecordImportDTO } from 'src/engine/core-modules/record-import/dtos/record-import.dto';
import { RecordImportWorkspaceService } from 'src/engine/core-modules/record-import/services/record-import.workspace-service';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@MetadataResolver()
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.IMPORT_CSV),
)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class RecordImportResolver {
  constructor(
    private readonly recordImportWorkspaceService: RecordImportWorkspaceService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Mutation(() => RecordImportPreviewDTO)
  async createRecordImport(
    @Args('input') input: CreateRecordImportInput,
  ): Promise<RecordImportPreviewDTO> {
    return this.recordImportWorkspaceService.create({
      ...input,
      authContext: await this.getAuthContextIfEnabled(),
    });
  }

  @Query(() => RecordImportPreviewDTO)
  async recordImportPreview(
    @Args('input') input: PreviewRecordImportSheetInput,
  ): Promise<RecordImportPreviewDTO> {
    return this.recordImportWorkspaceService.preview({
      ...input,
      authContext: await this.getAuthContextIfEnabled(),
    });
  }

  @Mutation(() => RecordImportDTO)
  async prepareRecordImport(
    @Args('input') input: PrepareRecordImportInput,
  ): Promise<RecordImportDTO> {
    return this.recordImportWorkspaceService.prepare({
      ...input,
      authContext: await this.getAuthContextIfEnabled(),
    });
  }

  @Query(() => RecordImportColumnSamplesDTO)
  async recordImportColumnSamples(
    @Args('input') input: RecordImportSessionInput,
  ): Promise<RecordImportColumnSamplesDTO> {
    return this.recordImportWorkspaceService.getColumnSamples({
      ...input,
      authContext: await this.getAuthContextIfEnabled(),
    });
  }

  @Mutation(() => RecordImportDTO)
  async setRecordImportMapping(
    @Args('input') input: SetRecordImportMappingInput,
  ): Promise<RecordImportDTO> {
    return this.recordImportWorkspaceService.setMapping({
      ...input,
      authContext: await this.getAuthContextIfEnabled(),
    });
  }

  @Mutation(() => RecordImportDTO)
  async startRecordImport(
    @Args('input') input: RecordImportVersionedInput,
  ): Promise<RecordImportDTO> {
    return this.recordImportWorkspaceService.start({
      ...input,
      authContext: await this.getAuthContextIfEnabled(),
    });
  }

  @Mutation(() => Boolean)
  async cancelRecordImport(
    @Args('input') input: RecordImportSessionInput,
  ): Promise<boolean> {
    return this.recordImportWorkspaceService.cancel({
      ...input,
      authContext: await this.getAuthContextIfEnabled(),
    });
  }

  @Query(() => RecordImportDTO)
  async recordImport(
    @Args('input') input: RecordImportSessionInput,
  ): Promise<RecordImportDTO> {
    return this.recordImportWorkspaceService.get({
      ...input,
      authContext: await this.getAuthContextIfEnabled(),
    });
  }

  @Query(() => String)
  async recordImportReportUrl(
    @Args('input') input: RecordImportSessionInput,
  ): Promise<string> {
    return this.recordImportWorkspaceService.getReportUrl({
      ...input,
      authContext: await this.getAuthContextIfEnabled(),
    });
  }

  @Subscription(() => RecordImportDTO, {
    resolve: (payload: RecordImportDTO) => payload,
  })
  async recordImportProgress(
    @Args('input') input: RecordImportSessionInput,
  ): Promise<AsyncIterableIterator<RecordImportDTO>> {
    return this.recordImportWorkspaceService.stream({
      ...input,
      authContext: await this.getAuthContextIfEnabled(),
    });
  }

  private async getAuthContextIfEnabled() {
    const authContext = getWorkspaceAuthContext();

    if (
      !(await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_ASYNC_CSV_IMPORT_ENABLED,
        authContext.workspace.id,
      ))
    ) {
      throw new ForbiddenError(
        'Asynchronous CSV import is not enabled for this workspace',
      );
    }

    return authContext;
  }
}
