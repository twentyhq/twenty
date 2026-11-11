import { type buildDatabaseEventTriggerManifestResolver } from 'src/engine/core-modules/application/application-manifest/utils/build-database-event-trigger-manifest-resolver.util';

export type DatabaseEventTriggerManifestResolver = ReturnType<
  typeof buildDatabaseEventTriggerManifestResolver
>;
