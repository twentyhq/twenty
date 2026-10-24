import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Subscription } from '@nestjs/graphql';

import { type Request } from 'express';
import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CreateRecordExportInput } from 'src/engine/core-modules/record-export/dtos/create-record-export.input';
import { RecordExportDTO } from 'src/engine/core-modules/record-export/dtos/record-export.dto';
import { RecordExportExceptionFilter } from 'src/engine/core-modules/record-export/record-export-exception-filter';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';

@MetadataResolver()
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: { withUser: true, withoutUser: false },
    application: { withUser: true, withoutUser: false },
  }),
  SettingsPermissionGuard(PermissionFlagType.EXPORT_CSV),
)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PreventNestToAutoLogGraphqlErrorsFilter,
  RecordExportExceptionFilter,
)
export class RecordExportResolver {
  constructor(
    private readonly recordExportWorkspaceService: RecordExportWorkspaceService,
  ) {}

  @Subscription(() => RecordExportDTO, {
    resolve: (payload: RecordExportDTO) => payload,
  })
  async exportRecords(
    @Args('input') input: CreateRecordExportInput,
    @Context() context: { req: Request },
  ): Promise<AsyncIterableIterator<RecordExportDTO>> {
    const authContext = getWorkspaceAuthContext();
    return this.recordExportWorkspaceService.stream({
      parameters: input,
      authContext,
      requestTokenHash:
        this.recordExportWorkspaceService.getRequestTokenHashOrThrow(
          context.req,
        ),
    });
  }
}
