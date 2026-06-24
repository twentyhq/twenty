import { getIndexViewUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType, ViewKey } from 'twenty-shared/types';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

import { enrichAllFlatEntityMapsWithDefaultViews } from '../enrich-all-flat-entity-maps-with-default-views.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'app-uid';
const OBJECT_UNIVERSAL_IDENTIFIER = 'object-uid';
const NAME_FIELD_UNIVERSAL_IDENTIFIER = 'field-name-uid';
const CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER = 'field-created-at-uid';

const now = '2026-01-01T00:00:00.000Z';

const flatApplication = {
  id: 'app-id',
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
} as unknown as FlatApplication;

const makeObject = (): UniversalFlatObjectMetadata =>
  ({
    universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    labelIdentifierFieldMetadataUniversalIdentifier:
      NAME_FIELD_UNIVERSAL_IDENTIFIER,
  }) as unknown as UniversalFlatObjectMetadata;

const makeField = ({
  universalIdentifier,
  name,
  type,
}: {
  universalIdentifier: string;
  name: string;
  type: FieldMetadataType;
}): UniversalFlatFieldMetadata =>
  ({
    universalIdentifier,
    objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    name,
    type,
  }) as unknown as UniversalFlatFieldMetadata;

const buildMaps = () => {
  const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

  allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
    OBJECT_UNIVERSAL_IDENTIFIER
  ] = makeObject();

  for (const field of [
    makeField({
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'name',
      type: FieldMetadataType.TEXT,
    }),
    makeField({
      universalIdentifier: CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
    }),
  ]) {
    allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
      field.universalIdentifier
    ] = field;
  }

  return allFlatEntityMaps;
};

describe('enrichAllFlatEntityMapsWithDefaultViews', () => {
  it('should generate a deterministic INDEX view with view fields for an object', () => {
    const allFlatEntityMaps = buildMaps();

    enrichAllFlatEntityMapsWithDefaultViews({
      allFlatEntityMaps,
      flatApplication,
      now,
    });

    const expectedViewUniversalIdentifier = getIndexViewUniversalIdentifier({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    });

    const flatView =
      allFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
        expectedViewUniversalIdentifier
      ];

    expect(flatView).toBeDefined();
    expect(flatView?.key).toBe(ViewKey.INDEX);
    expect(flatView?.isSystemSideEffect).toBe(true);
    expect(flatView?.objectMetadataUniversalIdentifier).toBe(
      OBJECT_UNIVERSAL_IDENTIFIER,
    );

    expect(
      Object.keys(allFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier),
    ).toHaveLength(2);
  });

  it('should be idempotent when the INDEX view already exists', () => {
    const allFlatEntityMaps = buildMaps();

    enrichAllFlatEntityMapsWithDefaultViews({
      allFlatEntityMaps,
      flatApplication,
      now,
    });

    expect(() =>
      enrichAllFlatEntityMapsWithDefaultViews({
        allFlatEntityMaps,
        flatApplication,
        now,
      }),
    ).not.toThrow();

    expect(
      Object.keys(allFlatEntityMaps.flatViewMaps.byUniversalIdentifier),
    ).toHaveLength(1);
    expect(
      Object.keys(allFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier),
    ).toHaveLength(2);
  });

  it('should skip objects owned by another application', () => {
    const allFlatEntityMaps = buildMaps();

    enrichAllFlatEntityMapsWithDefaultViews({
      allFlatEntityMaps,
      flatApplication: {
        id: 'other-app-id',
        universalIdentifier: 'other-app-uid',
      } as unknown as FlatApplication,
      now,
    });

    expect(
      Object.keys(allFlatEntityMaps.flatViewMaps.byUniversalIdentifier),
    ).toHaveLength(0);
  });
});
