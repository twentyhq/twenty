import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => UserWorkspace)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class UserWorkspaceResolver {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
  ) {}
}
