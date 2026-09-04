import { FieldMetadataType } from 'twenty-shared/types';

import { classifyApplicationFlatEntities } from 'src/engine/core-modules/application/application-manifest/utils/classify-application-flat-entities.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

const APP_ID = 'application-id';
const APP_UID = '11111111-1111-4111-8111-111111111111';
const CUSTOM_APP_ID = 'custom-application-id';
const CUSTOM_APP_UID = '99999999-9999-4999-8999-999999999999';
const PET_UID = '22222222-2222-4222-8222-222222222222';
const AGE_FIELD_UID = '33333333-3333-4333-8333-333333333333';
const CUSTOM_FIELD_UID = '44444444-4444-4444-8444-444444444444';
const ROLE_TARGET_UID = '55555555-5555-4555-8555-555555555555';

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

const memberRoleTarget = {
  id: 'role-target-id',
  universalIdentifier: ROLE_TARGET_UID,
  applicationId: APP_ID,
  applicationUniversalIdentifier: APP_UID,
  workspaceId: 'workspace-id',
  roleId: 'role-id',
  roleUniversalIdentifier: 'role-universal-identifier',
  userWorkspaceId: 'user-workspace-id',
  agentId: null,
  agentUniversalIdentifier: null,
  apiKeyId: null,
  createdAt: '2026-09-03T10:00:00.000Z',
  updatedAt: '2026-09-03T10:00:00.000Z',
} as FlatRoleTarget;

const buildMaps = () => {
  const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

  allFlatEntityMaps.flatObjectMetadataMaps =
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: petObject,
      flatEntityMaps: allFlatEntityMaps.flatObjectMetadataMaps,
    });
  for (const flatEntity of [ageField, customField]) {
    allFlatEntityMaps.flatFieldMetadataMaps =
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity,
        flatEntityMaps: allFlatEntityMaps.flatFieldMetadataMaps,
      });
  }
  allFlatEntityMaps.flatRoleTargetMaps = addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: memberRoleTarget,
    flatEntityMaps: allFlatEntityMaps.flatRoleTargetMaps,
  });

  const applicationAllFlatEntityMaps = createEmptyAllFlatEntityMaps();

  applicationAllFlatEntityMaps.flatObjectMetadataMaps =
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: petObject,
      flatEntityMaps: applicationAllFlatEntityMaps.flatObjectMetadataMaps,
    });
  applicationAllFlatEntityMaps.flatFieldMetadataMaps =
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: ageField,
      flatEntityMaps: applicationAllFlatEntityMaps.flatFieldMetadataMaps,
    });
  applicationAllFlatEntityMaps.flatRoleTargetMaps =
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: memberRoleTarget,
      flatEntityMaps: applicationAllFlatEntityMaps.flatRoleTargetMaps,
    });

  return { allFlatEntityMaps, applicationAllFlatEntityMaps };
};

describe('classifyApplicationFlatEntities', () => {
  const coverage = classifyApplicationFlatEntities({
    flatApplication,
    ...buildMaps(),
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

  it('should return the entries sorted by kind, status and identifier', () => {
    const keys = coverage.map(
      ({ metadataName, status, universalIdentifier }) =>
        `${metadataName}:${status}:${universalIdentifier}`,
    );

    expect(keys).toEqual([...keys].sort());
  });
});
