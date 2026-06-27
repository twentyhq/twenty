import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { DpaDocumentDTO } from 'src/engine/core-modules/dpa/dtos/dpa-document.dto';
import { GenerateSignedDpaInput } from 'src/engine/core-modules/dpa/dtos/generate-signed-dpa.input';
import { GenerateSignedDpaResult } from 'src/engine/core-modules/dpa/dtos/generate-signed-dpa.result';
import { DpaAgreementEntity } from 'src/engine/core-modules/dpa/entities/dpa-agreement.entity';
import { DpaService } from 'src/engine/core-modules/dpa/services/dpa.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@CoreResolver(() => DpaAgreementEntity)
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
)
@UsePipes(ResolverValidationPipe)
export class DpaResolver {
  constructor(private readonly dpaService: DpaService) {}

  // Region/entity/law/SCC state are resolved server-side from the workspace
  // deployment — the customer cannot pick them.
  @Query(() => DpaDocumentDTO)
  dpaPreview(@AuthWorkspace() workspace: WorkspaceEntity): DpaDocumentDTO {
    return this.dpaService.getPreviewForWorkspace(workspace);
  }

  @Query(() => [DpaAgreementEntity])
  async dpaAgreements(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<DpaAgreementEntity[]> {
    return this.dpaService.listAgreements(workspace.id);
  }

  @Mutation(() => GenerateSignedDpaResult)
  async generateSignedDpa(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @Args('input') input: GenerateSignedDpaInput,
  ): Promise<GenerateSignedDpaResult> {
    return this.dpaService.generateSignedDpa({
      workspace,
      userId: user.id,
      userEmail: user.email,
      input,
    });
  }

  // Signed, time-limited URL to (re)download a stored executed copy. Null for
  // click-through records, which have no signed PDF.
  @ResolveField(() => String, { nullable: true })
  async downloadUrl(
    @Parent() agreement: DpaAgreementEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | null> {
    return this.dpaService.getDownloadUrl(agreement, workspace.id);
  }
}
