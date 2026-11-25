import { type DatabaseEventTriggerManifestLookup } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-lookup.type';

export const findDatabaseEventTriggerManifestObjectUniversalIdentifier = ({
  lookup,
  objectNameSingular,
}: {
  lookup: DatabaseEventTriggerManifestLookup;
  objectNameSingular: string;
}): string | undefined =>
  lookup.objectMaps
    .flatMap((maps) => Object.values(maps.byUniversalIdentifier))
    .find((object) => object?.nameSingular === objectNameSingular)
    ?.universalIdentifier;
