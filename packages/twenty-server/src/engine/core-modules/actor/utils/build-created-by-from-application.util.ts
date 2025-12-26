import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

type BuildCreatedByFromApplicationArgs = {
  application: ApplicationEntity;
};
export const buildCreatedByFromApplication = ({
  application,
}: BuildCreatedByFromApplicationArgs): ActorMetadata => ({
  source: FieldActorSource.APPLICATION,
  name: application.name,
  workspaceMemberId: null,
  context: {},
});
