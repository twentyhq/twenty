import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

// A caller running inside an uncommitted workspace migration must build the
// schema from its own in-flight maps: the shared cache is neither the committed
// state nor the migration state at that point.
export type SchemaFlatEntityMapsOverride = Partial<
  Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatIndexMaps'
  >
>;
