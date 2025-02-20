import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared';

import { buildCreatedByFromApiKey } from 'src/engine/core-modules/actor/utils/build-created-by-from-api-key.util';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class CreatedByFromAuthContextService {
  private readonly logger = new Logger(CreatedByFromAuthContextService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  public async buildCreatedBy(
    authContext: AuthContext,
  ): Promise<ActorMetadata> {
    const { workspace, workspaceMemberId, user, apiKey } = authContext;

    // TODO: remove that code once we have the workspace member id in all tokens
    if (isDefined(workspaceMemberId) && isDefined(user)) {
      return buildCreatedByFromFullNameMetadata({
        fullNameMetadata: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
        workspaceMemberId,
      });
    }

    if (isDefined(user)) {
      this.logger.warn("User doesn't have a workspace member id in the token");

      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
          workspace.id,
          'workspaceMember',
        );

      const workspaceMember = await workspaceMemberRepository.findOneOrFail({
        where: {
          userId: user.id,
        },
      });

      return buildCreatedByFromFullNameMetadata({
        fullNameMetadata: workspaceMember.name,
        workspaceMemberId: workspaceMember.id,
      });
    }

    if (isDefined(apiKey)) {
      return buildCreatedByFromApiKey({
        apiKey,
      });
    }

    throw new Error(
      'Unable to build createdBy metadata - no valid actor information found in auth context',
    );
  }
}
