import { type ViewFieldGroupManifest } from 'twenty-shared/application';

import { fromFlatViewFieldGroupToViewFieldGroupManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-field-group-to-view-field-group-manifest.util';
import { fromViewFieldGroupManifestToUniversalFlatViewFieldGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-view-field-group-manifest-to-universal-flat-view-field-group.util';
import { type UniversalFlatViewFieldGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field-group.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const VIEW_UID = '22222222-2222-4222-8222-222222222222';
const VIEW_FIELD_GROUP_UID = '33333333-3333-4333-8333-333333333333';
const NOW = '2026-09-03T10:00:00.000Z';

const VIEW_FIELD_GROUP_MANIFEST: Required<ViewFieldGroupManifest> = {
  universalIdentifier: VIEW_FIELD_GROUP_UID,
  name: 'Details',
  position: 1,
  isVisible: false,
};

const forward = (viewFieldGroupManifest: ViewFieldGroupManifest) =>
  fromViewFieldGroupManifestToUniversalFlatViewFieldGroup({
    viewFieldGroupManifest,
    viewUniversalIdentifier: VIEW_UID,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

const roundTripFlatViewFieldGroup = (
  flatViewFieldGroup: UniversalFlatViewFieldGroup,
) =>
  compareTwoFlatEntity({
    fromUniversalFlatEntity: flatViewFieldGroup,
    toUniversalFlatEntity: forward(
      fromFlatViewFieldGroupToViewFieldGroupManifest({ flatViewFieldGroup }),
    ),
    metadataName: 'viewFieldGroup',
  });

describe('fromFlatViewFieldGroupToViewFieldGroupManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatViewFieldGroupToViewFieldGroupManifest({
        flatViewFieldGroup: forward(VIEW_FIELD_GROUP_MANIFEST),
      }),
    ).toEqual(VIEW_FIELD_GROUP_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatViewFieldGroup: UniversalFlatViewFieldGroup = {
      universalIdentifier: VIEW_FIELD_GROUP_UID,
      applicationUniversalIdentifier: APP_UID,
      viewUniversalIdentifier: VIEW_UID,
      name: '',
      position: 0,
      isVisible: false,
      isActive: true,
      isSystemSideEffect: false,
      overrides: null,
      viewFieldUniversalIdentifiers: [],
      createdAt: NOW,
      updatedAt: NOW,
      deletedAt: null,
    };

    expect(roundTripFlatViewFieldGroup(flatViewFieldGroup)).toBeUndefined();
  });

  it('should write the name and the visibility the forward converter defaulted', () => {
    const {
      name: _name,
      isVisible: _isVisible,
      ...manifestWithoutNameAndVisibility
    } = VIEW_FIELD_GROUP_MANIFEST;

    expect(
      fromFlatViewFieldGroupToViewFieldGroupManifest({
        flatViewFieldGroup: forward(manifestWithoutNameAndVisibility),
      }),
    ).toStrictEqual({
      ...manifestWithoutNameAndVisibility,
      name: '',
      isVisible: true,
    });
  });
});
