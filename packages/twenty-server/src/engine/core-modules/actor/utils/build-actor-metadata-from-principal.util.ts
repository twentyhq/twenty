import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildCreatedByFromApplication } from 'src/engine/core-modules/actor/utils/build-created-by-from-application.util';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export const buildActorMetadataFromPrincipal = ({
  workspaceMember,
  application,
}: {
  workspaceMember?: WorkspaceMemberWorkspaceEntity;
  application?: FlatApplication;
}): ActorMetadata | undefined => {
  if (isDefined(workspaceMember)) {
    return buildCreatedByFromFullNameMetadata({
      fullNameMetadata: {
        firstName: workspaceMember.name.firstName,
        lastName: workspaceMember.name.lastName,
      },
      workspaceMemberId: workspaceMember.id,
    });
  }

  if (isDefined(application)) {
    return buildCreatedByFromApplication({ application });
  }

  return undefined;
};
