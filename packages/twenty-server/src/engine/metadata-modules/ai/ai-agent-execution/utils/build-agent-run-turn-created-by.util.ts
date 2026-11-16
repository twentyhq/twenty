import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildActorMetadataFromAuthContext } from 'src/engine/core-modules/actor/utils/build-actor-metadata-from-auth-context.util';
import { buildCreatedByFromApplication } from 'src/engine/core-modules/actor/utils/build-created-by-from-application.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const buildAgentRunTurnCreatedBy = ({
  actorMetadata,
  callerApplication,
  authContext,
}: {
  actorMetadata: ActorMetadata | undefined;
  callerApplication: FlatApplication | undefined;
  authContext: WorkspaceAuthContext;
}): ActorMetadata => {
  if (!isDefined(actorMetadata)) {
    return isDefined(callerApplication)
      ? buildCreatedByFromApplication({ application: callerApplication })
      : buildActorMetadataFromAuthContext(authContext);
  }

  if (!isDefined(callerApplication)) {
    return actorMetadata;
  }

  // the application is kept on a turn it runs as a member, so it can read that turn back
  return {
    ...actorMetadata,
    context: { ...actorMetadata.context, applicationId: callerApplication.id },
  };
};
