import { UsePipes, UseGuards } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { DpaAgreementEntity } from 'src/engine/core-modules/dpa/entities/dpa-agreement.entity';
import { DpaService } from 'src/engine/core-modules/dpa/services/dpa.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@CoreResolver(() => DpaAgreementEntity)
@UsePipes(ResolverValidationPipe)
export class DpaAgreementFieldsResolver {
  constructor(private readonly dpaService: DpaService) {}

  // Null for click-through records, which have no signed PDF.
  @ResolveField(() => String, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async downloadUrl(
    @Parent() agreement: DpaAgreementEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | null> {
    return this.dpaService.getDownloadUrl(agreement, workspace.id);
  }
}
