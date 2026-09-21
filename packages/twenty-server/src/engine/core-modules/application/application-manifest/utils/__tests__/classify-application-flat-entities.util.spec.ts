import { FieldMetadataType } from 'twenty-shared/types';

import { classifyApplicationFlatEntities } from 'src/engine/core-modules/application/application-manifest/utils/classify-application-flat-entities.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

const APP_ID = 'application-id';
const APP_UID = '11111111-1111-4111-8111-111111111111';
const CUSTOM_APP_ID = 'custom-application-id';
const CUSTOM_APP_UID = '99999999-9999-4999-8999-999999999999';
const PET_UID = '22222222-2222-4222-8222-222222222222';
const AGE_FIELD_UID = '33333333-3333-4333-8333-333333333333';
const CUSTOM_FIELD_UID = '44444444-4444-4444-8444-444444444444';
const ROLE_TARGET_UID = '55555555-5555-4555-8555-555555555555';
const ROLE_UID = '66666666-6666-4666-8666-666666666666';
const FOREIGN_ROLE_TARGET_UID = '77777777-7777-4777-8777-777777777777';
const COMPANY_UID = '88888888-8888-4888-8888-888888888888';
const COMPANY_PET_FIELD_UID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const NOW = '2026-09-03T10:00:00.000Z';

const flatApplication = {
  id: APP_ID,
  universalIdentifier: APP_UID,
} as FlatApplication;

const petObject = getFlatObjectMetadataMock({
  universalIdentifier: PET_UID,
  applicationId: APP_ID,
  applicationUniversalIdentifier: APP_UID,
});

const ageField = getFlatFieldMetadataMock({
  universalIdentifier: AGE_FIELD_UID,
  objectMetadataId: petObject.id,
  objectMetadataUniversalIdentifier: PET_UID,
  applicationId: APP_ID,
  applicationUniversalIdentifier: APP_UID,
  type: FieldMetadataType.NUMBER,
  isSystemSideEffect: true,
});

const customField = getFlatFieldMetadataMock({
  universalIdentifier: CUSTOM_FIELD_UID,
  objectMetadataId: petObject.id,
  objectMetadataUniversalIdentifier: PET_UID,
  applicationId: CUSTOM_APP_ID,
  applicationUniversalIdentifier: CUSTOM_APP_UID,
  type: FieldMetadataType.TEXT,
});

const companyPetField = getFlatFieldMetadataMock({
  universalIdentifier: COMPANY_PET_FIELD_UID,
  objectMetadataId: 'company-id',
  objectMetadataUniversalIdentifier: COMPANY_UID,
  applicationId: CUSTOM_APP_ID,
  applicationUniversalIdentifier: CUSTOM_APP_UID,
  type: FieldMetadataType.RELATION,
  relationTargetObjectMetadataUniversalIdentifier: PET_UID,
});

const applicationRole = {
  id: 'role-id',
  universalIdentifier: ROLE_UID,
  applicationId: APP_ID,
  applicationUniversalIdentifier: APP_UID,
  workspaceId: 'workspace-id',
  label: 'Ticketing agent',
  createdAt: NOW,
  updatedAt: NOW,
} as FlatRole;

const buildMemberRoleTarget = ({
  universalIdentifier,
  applicationId,
  applicationUniversalIdentifier,
}: {
  universalIdentifier: string;
  applicationId: string;
  applicationUniversalIdentifier: string;
}): FlatRoleTarget =>
  ({
    id: `role-target-${universalIdentifier}`,
    universalIdentifier,
    applicationId,
    applicationUniversalIdentifier,
    workspaceId: 'workspace-id',
    roleId: applicationRole.id,
    roleUniversalIdentifier: ROLE_UID,
    userWorkspaceId: 'user-workspace-id',
    agentId: null,
    agentUniversalIdentifier: null,
    apiKeyId: null,
    createdAt: NOW,
    updatedAt: NOW,
  }) as FlatRoleTarget;

const ownMemberRoleTarget = buildMemberRoleTarget({
  universalIdentifier: ROLE_TARGET_UID,
  applicationId: APP_ID,
  applicationUniversalIdentifier: APP_UID,
});

const foreignMemberRoleTarget = buildMemberRoleTarget({
  universalIdentifier: FOREIGN_ROLE_TARGET_UID,
  applicationId: CUSTOM_APP_ID,
  applicationUniversalIdentifier: CUSTOM_APP_UID,
});

const buildMaps = ({
  objects,
  fields,
  roles,
  roleTargets,
}: {
  objects: FlatObjectMetadata[];
  fields: FlatFieldMetadata[];
  roles: FlatRole[];
  roleTargets: FlatRoleTarget[];
}): AllFlatEntityMaps => {
  const maps = createEmptyAllFlatEntityMaps();

  for (const flatEntity of objects) {
    maps.flatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity,
      flatEntityMaps: maps.flatObjectMetadataMaps,
    });
  }
  for (const flatEntity of fields) {
    maps.flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity,
      flatEntityMaps: maps.flatFieldMetadataMaps,
    });
  }
  for (const flatEntity of roles) {
    maps.flatRoleMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity,
      flatEntityMaps: maps.flatRoleMaps,
    });
  }
  for (const flatEntity of roleTargets) {
    maps.flatRoleTargetMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity,
      flatEntityMaps: maps.flatRoleTargetMaps,
    });
  }

  return maps;
};

describe('classifyApplicationFlatEntities', () => {
  const coverage = classifyApplicationFlatEntities({
    flatApplication,
    allFlatEntityMaps: buildMaps({
      objects: [petObject],
      fields: [ageField, customField, companyPetField],
      roles: [applicationRole],
      roleTargets: [ownMemberRoleTarget, foreignMemberRoleTarget],
    }),
    applicationAllFlatEntityMaps: buildMaps({
      objects: [petObject],
      fields: [ageField],
      roles: [applicationRole],
      roleTargets: [ownMemberRoleTarget],
    }),
    reconstructedCoverage: [
      {
        metadataName: 'objectMetadata',
        universalIdentifier: PET_UID,
        status: ApplicationExportCoverageStatus.EXPORTED,
      },
    ],
  });
  const entryOf = (universalIdentifier: string) =>
    coverage.find((entry) => entry.universalIdentifier === universalIdentifier);

  it('should keep the reconstruction verdict for rows it already covers', () => {
    expect(entryOf(PET_UID)).toMatchObject({
      metadataName: 'objectMetadata',
      status: ApplicationExportCoverageStatus.EXPORTED,
    });
  });

  it('should classify an engine-derived row before anything else', () => {
    expect(entryOf(AGE_FIELD_UID)?.status).toBe(
      ApplicationExportCoverageStatus.ENGINE_DERIVED,
    );
  });

  it('should exclude a member role assignment as runtime state', () => {
    expect(entryOf(ROLE_TARGET_UID)).toMatchObject({
      status: ApplicationExportCoverageStatus.EXCLUDED,
      reason: 'member or API key role assignment',
    });
  });

  it('should report a field another application added to an exported object as foreign-owned', () => {
    expect(entryOf(CUSTOM_FIELD_UID)).toMatchObject({
      metadataName: 'fieldMetadata',
      status: ApplicationExportCoverageStatus.FOREIGN_OWNED,
      reason: `owned by application ${CUSTOM_APP_UID}`,
    });
  });

  it('should exclude a member assignment another application holds on an exported role instead of reporting it foreign-owned', () => {
    expect(entryOf(FOREIGN_ROLE_TARGET_UID)).toMatchObject({
      metadataName: 'roleTarget',
      status: ApplicationExportCoverageStatus.EXCLUDED,
      reason: 'member or API key role assignment',
    });
  });

  it('should ignore a foreign field that only references an exported object as a relation target', () => {
    expect(entryOf(COMPANY_PET_FIELD_UID)).toBeUndefined();
  });

  it('should return the entries sorted by kind, status and identifier', () => {
    const keys = coverage.map(
      ({ metadataName, status, universalIdentifier }) =>
        `${metadataName}:${status}:${universalIdentifier}`,
    );

    expect(keys).toEqual([...keys].sort());
  });
});
