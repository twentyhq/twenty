import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import {
  PersonDuplicateGroupsDTO,
  PersonDuplicatePairInput,
} from 'src/engine/core-modules/person-duplicate-review/dtos/person-duplicate-review.dto';
import { PersonDuplicateReviewService } from 'src/engine/core-modules/person-duplicate-review/person-duplicate-review.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';

@CoreResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard, NoPermissionGuard)
export class PersonDuplicateReviewResolver {
  constructor(
    private readonly personDuplicateReviewService: PersonDuplicateReviewService,
  ) {}

  @Query(() => PersonDuplicateGroupsDTO)
  async personDuplicateGroups(
    @AuthWorkspace() _workspace: WorkspaceEntity,
  ): Promise<PersonDuplicateGroupsDTO> {
    return this.personDuplicateReviewService.getDuplicateGroups({
      authContext: getWorkspaceAuthContext(),
    });
  }

  @Mutation(() => Boolean)
  async keepPersonDuplicateRecordsSeparate(
    @Args('pairs', { type: () => [PersonDuplicatePairInput] })
    pairs: PersonDuplicatePairInput[],
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() _workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.personDuplicateReviewService.keepSeparate({
      authContext: getWorkspaceAuthContext(),
      workspaceMemberId,
      pairs,
    });
  }
}
