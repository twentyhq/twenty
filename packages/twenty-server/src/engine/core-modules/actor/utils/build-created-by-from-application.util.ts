import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

type BuildCreatedByFromApplicationArgs = {
  application: FlatApplication;
};
export const buildCreatedByFromApplication = ({
  application,
}: BuildCreatedByFromApplicationArgs): ActorMetadata => ({
  source: FieldActorSource.APPLICATION,
  name: application.name,
  workspaceMemberId: null,
  context: {},
});
