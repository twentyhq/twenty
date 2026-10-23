import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

// The workspace custom application composes the workspace out of every
// application. The standard application shares that reach while it still
// runs the workspace's automated workflows.
export const isWorkspaceComposerApplication = ({
  application,
  workspaceCustomApplicationId,
}: {
  application: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
  workspaceCustomApplicationId: string | undefined;
}): boolean =>
  application.id === workspaceCustomApplicationId ||
  application.universalIdentifier ===
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;
