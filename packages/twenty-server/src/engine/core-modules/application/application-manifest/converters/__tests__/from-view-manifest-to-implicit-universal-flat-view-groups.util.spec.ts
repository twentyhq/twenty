import { type ViewManifest } from 'twenty-shared/application';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';

import { fromViewManifestToImplicitUniversalFlatViewGroups } from 'src/engine/core-modules/application/application-manifest/converters/from-view-manifest-to-implicit-universal-flat-view-groups.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const VIEW_UID = '22222222-2222-4222-8222-222222222222';
const MARKET_FIELD_UID = '33333333-3333-4333-8333-333333333333';
const NOW = '2026-09-03T10:00:00.000Z';

const VIEW_MANIFEST: ViewManifest = {
  universalIdentifier: VIEW_UID,
  name: 'Partners by market',
  objectUniversalIdentifier: '44444444-4444-4444-8444-444444444444',
  type: ViewType.TABLE,
  mainGroupByFieldMetadataUniversalIdentifier: MARKET_FIELD_UID,
};

const MARKET_FIELD_METADATA = {
  type: FieldMetadataType.SELECT,
  isNullable: true,
  options: [
    {
      id: 'a',
      value: 'AUSTRALIA',
      label: 'Australia',
      color: 'green',
      position: 0,
    },
    {
      id: 'b',
      value: 'SINGAPORE',
      label: 'Singapore',
      color: 'pink',
      position: 1,
    },
  ],
} as unknown as UniversalFlatFieldMetadata;

const computeImplicitViewGroups = ({
  viewManifest = VIEW_MANIFEST,
  mainGroupByFieldMetadata = MARKET_FIELD_METADATA,
}: {
  viewManifest?: ViewManifest;
  mainGroupByFieldMetadata?: UniversalFlatFieldMetadata;
} = {}) =>
  fromViewManifestToImplicitUniversalFlatViewGroups({
    viewManifest,
    mainGroupByFieldMetadata,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

describe('fromViewManifestToImplicitUniversalFlatViewGroups', () => {
  it('should create one view group per option plus a no value one', () => {
    expect(
      computeImplicitViewGroups().map(
        ({ fieldValue, position, isVisible }) => ({
          fieldValue,
          position,
          isVisible,
        }),
      ),
    ).toEqual([
      { fieldValue: 'AUSTRALIA', position: 0, isVisible: true },
      { fieldValue: 'SINGAPORE', position: 1, isVisible: true },
      { fieldValue: '', position: 2, isVisible: true },
    ]);
  });

  it('should not create a no value view group for a non nullable field', () => {
    expect(
      computeImplicitViewGroups({
        mainGroupByFieldMetadata: {
          ...MARKET_FIELD_METADATA,
          isNullable: false,
        },
      }).map(({ fieldValue }) => fieldValue),
    ).toEqual(['AUSTRALIA', 'SINGAPORE']);
  });

  it('should skip the field values the manifest already declares', () => {
    expect(
      computeImplicitViewGroups({
        viewManifest: {
          ...VIEW_MANIFEST,
          groups: [
            {
              universalIdentifier: '55555555-5555-4555-8555-555555555555',
              fieldValue: 'AUSTRALIA',
              position: 0,
            },
          ],
        },
      }).map(({ fieldValue }) => fieldValue),
    ).toEqual(['SINGAPORE', '']);
  });

  it('should compute the same universal identifiers on every call', () => {
    expect(computeImplicitViewGroups()).toEqual(computeImplicitViewGroups());
  });
});
