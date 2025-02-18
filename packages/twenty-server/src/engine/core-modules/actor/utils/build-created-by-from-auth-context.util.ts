import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared';

import { buildCreatedByFromApiKey } from 'src/engine/core-modules/actor/utils/build-created-by-from-api-key.util';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

type BuildCreatedByFromAuthContextArgs = {
  authContext: AuthContext;
  twentyORMGlobalManager: TwentyORMGlobalManager;
  logger: Logger;
};
export const buildCreatedByFromAuthContext = async ({
  authContext,
  twentyORMGlobalManager,
  logger,
}: BuildCreatedByFromAuthContextArgs): Promise<ActorMetadata> => {
  const { workspace, workspaceMemberId, user, apiKey } = authContext;

  switch (true) {
    // TODO: remove that code once we have the workspace member id in all tokens
    case isDefined(workspaceMemberId) && isDefined(user): {
      return buildCreatedByFromFullNameMetadata({
        fullNameMetadata: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
        workspaceMemberId,
      });
    }
    case isDefined(user): {
      logger.warn("User doesn't have a workspace member id in the token");
      const workspaceMemberRepository =
        await twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
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
    case isDefined(apiKey): {
      return buildCreatedByFromApiKey({
        apiKey,
      });
    }
    default: {
      // TODO handle gracefully
      // Not managed from now
      throw new Error('TODO');
    }
  }
};
