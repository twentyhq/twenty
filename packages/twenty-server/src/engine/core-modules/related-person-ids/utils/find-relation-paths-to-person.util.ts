import {
  findRelationPaths,
  type RelationHop,
  type RelationPath,
} from 'src/engine/core-modules/timeline-feed/projection/utils/find-relation-paths.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const PERSON_OBJECT_NAME_SINGULAR = 'person';
const DEFAULT_MAX_RELATION_DEPTH_TO_PERSON = 3;

export type RelationHopToPerson = RelationHop;

export type RelationPathToPerson = RelationPath;

export const findRelationPathsToPerson = ({
  rootObjectNameSingular,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  maxDepth = DEFAULT_MAX_RELATION_DEPTH_TO_PERSON,
}: {
  rootObjectNameSingular: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  maxDepth?: number;
}): RelationPathToPerson[] =>
  findRelationPaths({
    fromObjectNameSingular: rootObjectNameSingular,
    toObjectNameSingular: PERSON_OBJECT_NAME_SINGULAR,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    maxDepth,
  });
