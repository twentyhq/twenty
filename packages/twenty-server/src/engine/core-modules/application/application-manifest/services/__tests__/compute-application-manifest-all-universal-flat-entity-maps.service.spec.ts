import { type Manifest } from 'twenty-shared/application';
import { FieldMetadataType, IndexType } from 'twenty-shared/types';

import { ComputeApplicationManifestAllUniversalFlatEntityMapsService } from 'src/engine/core-modules/application/application-manifest/services/compute-application-manifest-all-universal-flat-entity-maps.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

describe('ComputeApplicationManifestAllUniversalFlatEntityMapsService', () => {
  const secretEncryptionService = {
    encryptVersioned: jest.fn().mockReturnValue('encrypted'),
  } as unknown as SecretEncryptionService;

  const service =
    new ComputeApplicationManifestAllUniversalFlatEntityMapsService(
      secretEncryptionService,
    );

  const ownerFlatApplication = {
    id: 'app-id-1',
    universalIdentifier: 'app-universal-id-1',
    sourceType: 'CUSTOM',
  } as unknown as FlatApplication;

  const now = '2026-01-01T00:00:00.000Z';
  const workspaceId = 'ws-id-1';

  const baseEmptyManifest: Manifest = {
    application: {
      universalIdentifier: ownerFlatApplication.universalIdentifier,
    },
    objects: [],
    fields: [],
    logicFunctions: [],
    frontComponents: [],
    permissionFlags: [],
    roles: [],
    skills: [],
    agents: [],
    publicAssets: [],
    views: [],
    viewFields: [],
    navigationMenuItems: [],
    pageLayouts: [],
    pageLayoutTabs: [],
    commandMenuItems: [],
    timelineActivityTypes: [],
  } as unknown as Manifest;

  it('computes index defined on an app-defined custom object', () => {
    const objectUniversalIdentifier = 'custom-obj-uuid';
    const fieldUniversalIdentifier = 'custom-field-uuid';
    const indexUniversalIdentifier = 'custom-index-uuid';

    const manifest = {
      ...baseEmptyManifest,
      objects: [
        {
          universalIdentifier: objectUniversalIdentifier,
          nameSingular: 'customTicket',
          namePlural: 'customTickets',
          labelSingular: 'Custom Ticket',
          labelPlural: 'Custom Tickets',
          fields: [
            {
              universalIdentifier: fieldUniversalIdentifier,
              name: 'ticketCode',
              label: 'Ticket Code',
              type: FieldMetadataType.TEXT,
            },
          ],
        },
      ],
      indexes: [
        {
          universalIdentifier: indexUniversalIdentifier,
          objectUniversalIdentifier,
          indexType: IndexType.BTREE,
          isUnique: true,
          fields: [
            {
              universalIdentifier: 'index-field-entry-1',
              fieldUniversalIdentifier,
            },
          ],
        },
      ],
    } as unknown as Manifest;

    const fromAllFlatEntityMaps = createEmptyAllFlatEntityMaps();
    const result = service.compute({
      manifest,
      ownerFlatApplication,
      fromAllFlatEntityMaps,
      isLogicFunctionPrebuiltModeEnabled: false,
      now,
      workspaceId,
    });

    const index =
      result.flatIndexMaps.byUniversalIdentifier[indexUniversalIdentifier];

    expect(index).toBeDefined();
    expect(index?.universalIdentifier).toBe(indexUniversalIdentifier);
    expect(index?.objectMetadataUniversalIdentifier).toBe(
      objectUniversalIdentifier,
    );
    expect(index?.isUnique).toBe(true);
    expect(index?.universalFlatIndexFieldMetadatas).toHaveLength(1);
    expect(
      index?.universalFlatIndexFieldMetadatas[0]
        .fieldMetadataUniversalIdentifier,
    ).toBe(fieldUniversalIdentifier);
  });

  it('computes index defined on a standard object field added by the app', () => {
    const standardCompanyUniversalIdentifier =
      '20202020-b374-4779-a561-80086cb2e17f';
    const appFieldUniversalIdentifier = 'app-field-uuid-company';
    const appIndexUniversalIdentifier = 'app-index-uuid-company';

    const existingStandardCompanyObject = {
      id: 'company-id',
      universalIdentifier: standardCompanyUniversalIdentifier,
      nameSingular: 'company',
      namePlural: 'companies',
      labelSingular: 'Company',
      labelPlural: 'Companies',
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
    } as unknown as FlatObjectMetadata;

    const existingAllFlatEntityMaps = createEmptyAllFlatEntityMaps();

    existingAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      standardCompanyUniversalIdentifier
    ] = existingStandardCompanyObject;

    const manifest = {
      ...baseEmptyManifest,
      fields: [
        {
          universalIdentifier: appFieldUniversalIdentifier,
          objectUniversalIdentifier: standardCompanyUniversalIdentifier,
          name: 'erpId',
          label: 'ERP ID',
          type: FieldMetadataType.TEXT,
        },
      ],
      indexes: [
        {
          universalIdentifier: appIndexUniversalIdentifier,
          objectUniversalIdentifier: standardCompanyUniversalIdentifier,
          indexType: IndexType.BTREE,
          isUnique: true,
          fields: [
            {
              universalIdentifier: 'index-field-entry-company-1',
              fieldUniversalIdentifier: appFieldUniversalIdentifier,
            },
          ],
        },
      ],
    } as unknown as Manifest;

    const fromAllFlatEntityMaps = createEmptyAllFlatEntityMaps();

    const result = service.compute({
      manifest,
      ownerFlatApplication,
      fromAllFlatEntityMaps,
      existingAllFlatEntityMaps,
      isLogicFunctionPrebuiltModeEnabled: false,
      now,
      workspaceId,
    });

    const index =
      result.flatIndexMaps.byUniversalIdentifier[appIndexUniversalIdentifier];

    expect(index).toBeDefined();
    expect(index?.universalIdentifier).toBe(appIndexUniversalIdentifier);
    expect(index?.objectMetadataUniversalIdentifier).toBe(
      standardCompanyUniversalIdentifier,
    );
    expect(index?.isUnique).toBe(true);
    expect(index?.name).toMatch(/^IDX_UNIQUE_/);
    expect(index?.universalFlatIndexFieldMetadatas[0]).toMatchObject({
      order: 0,
      fieldMetadataUniversalIdentifier: appFieldUniversalIdentifier,
      indexMetadataUniversalIdentifier: appIndexUniversalIdentifier,
    });
  });

  it('throws when index references a field not defined in the application manifest', () => {
    const standardCompanyUniversalIdentifier =
      '20202020-b374-4779-a561-80086cb2e17f';
    const standardFieldUniversalIdentifier =
      '20202020-0000-0000-0000-000000000001';

    const existingStandardCompanyObject = {
      id: 'company-id',
      universalIdentifier: standardCompanyUniversalIdentifier,
      nameSingular: 'company',
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
    } as unknown as FlatObjectMetadata;

    const existingAllFlatEntityMaps = createEmptyAllFlatEntityMaps();

    existingAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      standardCompanyUniversalIdentifier
    ] = existingStandardCompanyObject;

    const manifest = {
      ...baseEmptyManifest,
      indexes: [
        {
          universalIdentifier: 'invalid-index-uuid',
          objectUniversalIdentifier: standardCompanyUniversalIdentifier,
          fields: [
            {
              universalIdentifier: 'field-entry-1',
              fieldUniversalIdentifier: standardFieldUniversalIdentifier,
            },
          ],
        },
      ],
    } as unknown as Manifest;

    expect(() =>
      service.compute({
        manifest,
        ownerFlatApplication,
        fromAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
        existingAllFlatEntityMaps,
        isLogicFunctionPrebuiltModeEnabled: false,
        now,
        workspaceId,
      }),
    ).toThrow(/references unknown field/);
  });

  it('throws when index references an unknown object', () => {
    const manifest = {
      ...baseEmptyManifest,
      indexes: [
        {
          universalIdentifier: 'index-unknown-obj',
          objectUniversalIdentifier: 'unknown-obj-uuid',
          fields: [
            {
              universalIdentifier: 'entry-1',
              fieldUniversalIdentifier: 'field-1',
            },
          ],
        },
      ],
    } as unknown as Manifest;

    expect(() =>
      service.compute({
        manifest,
        ownerFlatApplication,
        fromAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
        isLogicFunctionPrebuiltModeEnabled: false,
        now,
        workspaceId,
      }),
    ).toThrow(
      'Index "index-unknown-obj" references unknown object unknown-obj-uuid',
    );
  });
});
