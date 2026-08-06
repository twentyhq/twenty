import { findFlatFieldMetadataByName } from 'src/database/commands/upgrade-version-command/2-27/utils/find-flat-field-metadata-by-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const PERSON_OBJECT_ID = 'person-object-id';
const CONNECTION_OBJECT_ID = 'connection-object-id';

const buildMaps = (entities: Record<string, unknown>[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.id as string, entity]),
  ),
});

const flatObjectMetadataMaps = buildMaps([
  { id: PERSON_OBJECT_ID, nameSingular: 'person' },
  { id: CONNECTION_OBJECT_ID, nameSingular: 'connection' },
]) as unknown as FlatEntityMaps<FlatObjectMetadata>;

const flatFieldMetadataMaps = buildMaps([
  { id: 'person-name', name: 'name', objectMetadataId: PERSON_OBJECT_ID },
  {
    id: 'connection-name',
    name: 'name',
    objectMetadataId: CONNECTION_OBJECT_ID,
  },
  {
    id: 'connection-connected-to',
    name: 'connectedTo',
    objectMetadataId: CONNECTION_OBJECT_ID,
  },
]) as unknown as FlatEntityMaps<FlatFieldMetadata>;

describe('findFlatFieldMetadataByName', () => {
  it('scopes the field name to the requested object', () => {
    const result = findFlatFieldMetadataByName({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingular: 'connection',
      fieldName: 'name',
    });

    expect(result?.id).toBe('connection-name');
  });

  it('returns undefined when the object is absent', () => {
    const result = findFlatFieldMetadataByName({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingular: 'missingObject',
      fieldName: 'connectedTo',
    });

    expect(result).toBeUndefined();
  });

  it('returns undefined when the field is absent on that object', () => {
    const result = findFlatFieldMetadataByName({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingular: 'person',
      fieldName: 'connectedTo',
    });

    expect(result).toBeUndefined();
  });
});
