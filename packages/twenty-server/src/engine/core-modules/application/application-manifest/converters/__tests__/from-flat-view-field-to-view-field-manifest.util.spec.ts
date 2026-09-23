import { type ViewFieldManifest } from 'twenty-shared/application';
import { AggregateOperations } from 'twenty-shared/types';

import { fromFlatViewFieldToStandaloneViewFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-field-to-standalone-view-field-manifest.util';
import { fromFlatViewFieldToViewFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-field-to-view-field-manifest.util';
import { fromViewFieldManifestToUniversalFlatViewField } from 'src/engine/core-modules/application/application-manifest/converters/from-view-field-manifest-to-universal-flat-view-field.util';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const VIEW_UID = '22222222-2222-4222-8222-222222222222';
const VIEW_FIELD_UID = '33333333-3333-4333-8333-333333333333';
const FIELD_UID = '44444444-4444-4444-8444-444444444444';
const VIEW_FIELD_GROUP_UID = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-09-03T10:00:00.000Z';

const VIEW_FIELD_MANIFEST: Required<ViewFieldManifest> = {
  universalIdentifier: VIEW_FIELD_UID,
  fieldMetadataUniversalIdentifier: FIELD_UID,
  isVisible: false,
  size: 240,
  position: 3,
  aggregateOperation: AggregateOperations.SUM,
  viewFieldGroupUniversalIdentifier: VIEW_FIELD_GROUP_UID,
};

const MINIMAL_VIEW_FIELD_MANIFEST: ViewFieldManifest = {
  universalIdentifier: VIEW_FIELD_UID,
  fieldMetadataUniversalIdentifier: FIELD_UID,
  position: 3,
};

const forward = (viewFieldManifest: ViewFieldManifest) =>
  fromViewFieldManifestToUniversalFlatViewField({
    viewFieldManifest,
    viewUniversalIdentifier: VIEW_UID,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

const roundTripFlatViewField = (flatViewField: UniversalFlatViewField) =>
  compareTwoFlatEntity({
    fromUniversalFlatEntity: flatViewField,
    toUniversalFlatEntity: forward(
      fromFlatViewFieldToViewFieldManifest({ flatViewField }),
    ),
    metadataName: 'viewField',
  });

describe('fromFlatViewFieldToViewFieldManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatViewFieldToViewFieldManifest({
        flatViewField: forward(VIEW_FIELD_MANIFEST),
      }),
    ).toEqual(VIEW_FIELD_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatViewField: UniversalFlatViewField = {
      universalIdentifier: VIEW_FIELD_UID,
      applicationUniversalIdentifier: APP_UID,
      viewUniversalIdentifier: VIEW_UID,
      fieldMetadataUniversalIdentifier: FIELD_UID,
      viewFieldGroupUniversalIdentifier: VIEW_FIELD_GROUP_UID,
      isVisible: false,
      size: 240,
      position: 3,
      aggregateOperation: AggregateOperations.SUM,
      isActive: true,
      isSystemSideEffect: false,
      universalOverrides: null,
      createdAt: NOW,
      updatedAt: NOW,
      deletedAt: null,
    };

    expect(roundTripFlatViewField(flatViewField)).toBeUndefined();
  });

  it('should write the visibility and size the forward converter defaulted and omit the null slots', () => {
    const viewFieldManifest = fromFlatViewFieldToViewFieldManifest({
      flatViewField: forward(MINIMAL_VIEW_FIELD_MANIFEST),
    });

    expect(viewFieldManifest).toStrictEqual({
      ...MINIMAL_VIEW_FIELD_MANIFEST,
      isVisible: true,
      size: 0,
    });
    expect(viewFieldManifest).not.toHaveProperty('aggregateOperation');
    expect(viewFieldManifest).not.toHaveProperty(
      'viewFieldGroupUniversalIdentifier',
    );
  });
});

describe('fromFlatViewFieldToStandaloneViewFieldManifest', () => {
  it('should add the view universal identifier of the flat view field and keep every other property of the nested manifest', () => {
    expect(
      fromFlatViewFieldToStandaloneViewFieldManifest({
        flatViewField: forward(VIEW_FIELD_MANIFEST),
      }),
    ).toEqual({
      ...VIEW_FIELD_MANIFEST,
      viewUniversalIdentifier: VIEW_UID,
    });
  });

  it('should list the universal identifier first and the view universal identifier second', () => {
    const standaloneViewFieldManifest =
      fromFlatViewFieldToStandaloneViewFieldManifest({
        flatViewField: forward(VIEW_FIELD_MANIFEST),
      });

    expect(Object.keys(standaloneViewFieldManifest).slice(0, 2)).toEqual([
      'universalIdentifier',
      'viewUniversalIdentifier',
    ]);
  });
});
