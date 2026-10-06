import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildCreatedByFromAgent } from 'src/engine/core-modules/actor/utils/build-created-by-from-agent.util';
import { buildCreatedByFromApiKey } from 'src/engine/core-modules/actor/utils/build-created-by-from-api-key.util';
import { buildCreatedByFromApplication } from 'src/engine/core-modules/actor/utils/build-created-by-from-application.util';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const buildActorMetadataFromAuthContext = (
  authContext: WorkspaceAuthContext,
): ActorMetadata => {
  if (isUserAuthContext(authContext)) {
    return buildCreatedByFromFullNameMetadata({
      fullNameMetadata: authContext.workspaceMember.name,
      workspaceMemberId: authContext.workspaceMemberId,
    });
  }

  if (isApiKeyAuthContext(authContext)) {
    return buildCreatedByFromApiKey({
      apiKey: authContext.apiKey,
    });
  }

  if (isApplicationAuthContext(authContext)) {
    if (isDefined(authContext.actingAgent)) {
      return buildCreatedByFromAgent({
        agent: authContext.actingAgent,
        applicationId: authContext.application.id,
      });
    }

    return buildCreatedByFromApplication({
      application: authContext.application,
    });
  }

  throw new Error(
    'Unable to build actor metadata - no valid actor information found in auth context',
  );
};
