import { type PermissionFlagManifest } from 'twenty-shared/application';

import { fromFlatPermissionFlagToPermissionFlagManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-permission-flag-to-permission-flag-manifest.util';
import { fromPermissionFlagManifestToUniversalFlatPermissionFlag } from 'src/engine/core-modules/application/application-manifest/converters/from-permission-flag-manifest-to-universal-flat-permission-flag.util';
import { type UniversalFlatPermissionFlag } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-permission-flag.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const PERMISSION_FLAG_UID = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-09-14T10:00:00.000Z';

const PERMISSION_FLAG_MANIFEST: Required<PermissionFlagManifest> = {
  universalIdentifier: PERMISSION_FLAG_UID,
  key: 'EXPORT_TICKETS',
  label: 'Export tickets',
  description: 'Download tickets as a spreadsheet',
  icon: 'IconDownload',
  permissionType: 'settings',
};

const forward = (permissionFlagManifest: PermissionFlagManifest) =>
  fromPermissionFlagManifestToUniversalFlatPermissionFlag({
    permissionFlagManifest,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

describe('fromFlatPermissionFlagToPermissionFlagManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatPermissionFlagToPermissionFlagManifest({
        flatPermissionFlag: forward(PERMISSION_FLAG_MANIFEST),
      }),
    ).toEqual(PERMISSION_FLAG_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatPermissionFlag: UniversalFlatPermissionFlag = {
      ...forward(PERMISSION_FLAG_MANIFEST),
      description: null,
      icon: null,
      permissionType: 'settings',
    };

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatPermissionFlag,
        toUniversalFlatEntity: forward(
          fromFlatPermissionFlagToPermissionFlagManifest({
            flatPermissionFlag,
          }),
        ),
        metadataName: 'permissionFlag',
      }),
    ).toBeUndefined();
  });

  it('should omit the description and icon but keep the permission type of a flag stored without them', () => {
    const {
      description: _description,
      icon: _icon,
      ...manifestWithoutDescriptionAndIcon
    } = PERMISSION_FLAG_MANIFEST;

    expect(
      fromFlatPermissionFlagToPermissionFlagManifest({
        flatPermissionFlag: forward(manifestWithoutDescriptionAndIcon),
      }),
    ).toStrictEqual(manifestWithoutDescriptionAndIcon);
  });
});
