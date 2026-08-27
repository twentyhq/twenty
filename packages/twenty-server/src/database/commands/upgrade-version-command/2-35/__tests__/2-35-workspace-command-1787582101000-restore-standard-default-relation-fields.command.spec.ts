import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RestoreStandardDefaultRelationFieldsCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787582101000-restore-standard-default-relation-fields.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

jest.mock(
  'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant',
);

const computeTwentyStandardApplicationAllFlatEntityMapsMock =
  computeTwentyStandardApplicationAllFlatEntityMaps as jest.Mock;

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};

const TIMELINE_ACTIVITY_TARGET_MORPH_ID =
  STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId;

const TIMELINE_ACTIVITY_OBJECT_UID = 'timeline-activity-object-uid';
const PERSON_OBJECT_UID = 'person-object-uid';
const COMPANY_OBJECT_UID = 'company-object-uid';
const TARGET_PERSON_LEG_UID = 'target-person-leg-uid';
const PERSON_FORWARD_FIELD_UID = 'person-forward-field-uid';
const TARGET_COMPANY_LEG_UID = 'target-company-leg-uid';
const COMPANY_FORWARD_FIELD_UID = 'company-forward-field-uid';
const PERSON_ID_INDEX_UID = 'person-id-index-uid';

const buildByUniversalIdentifierMap = <
  T extends { universalIdentifier: string },
>(
  flatEntities: T[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
});

const timelineActivityObject = {
  universalIdentifier: TIMELINE_ACTIVITY_OBJECT_UID,
  nameSingular: 'timelineActivity',
};

const personObject = {
  universalIdentifier: PERSON_OBJECT_UID,
  nameSingular: 'person',
};

const companyObject = {
  universalIdentifier: COMPANY_OBJECT_UID,
  nameSingular: 'company',
};

const standardTargetPersonLeg = {
  universalIdentifier: TARGET_PERSON_LEG_UID,
  name: 'targetPerson',
  type: FieldMetadataType.MORPH_RELATION,
  morphId: TIMELINE_ACTIVITY_TARGET_MORPH_ID,
  objectMetadataUniversalIdentifier: TIMELINE_ACTIVITY_OBJECT_UID,
  relationTargetFieldMetadataUniversalIdentifier: PERSON_FORWARD_FIELD_UID,
};

const standardPersonForwardField = {
  universalIdentifier: PERSON_FORWARD_FIELD_UID,
  name: 'timelineActivities',
  type: FieldMetadataType.RELATION,
  objectMetadataUniversalIdentifier: PERSON_OBJECT_UID,
  relationTargetFieldMetadataUniversalIdentifier: TARGET_PERSON_LEG_UID,
};

const standardTargetCompanyLeg = {
  universalIdentifier: TARGET_COMPANY_LEG_UID,
  name: 'targetCompany',
  type: FieldMetadataType.MORPH_RELATION,
  morphId: TIMELINE_ACTIVITY_TARGET_MORPH_ID,
  objectMetadataUniversalIdentifier: TIMELINE_ACTIVITY_OBJECT_UID,
  relationTargetFieldMetadataUniversalIdentifier: COMPANY_FORWARD_FIELD_UID,
};

const standardCompanyForwardField = {
  universalIdentifier: COMPANY_FORWARD_FIELD_UID,
  name: 'timelineActivities',
  type: FieldMetadataType.RELATION,
  objectMetadataUniversalIdentifier: COMPANY_OBJECT_UID,
  relationTargetFieldMetadataUniversalIdentifier: TARGET_COMPANY_LEG_UID,
};

const standardPersonIdIndex = {
  universalIdentifier: PERSON_ID_INDEX_UID,
  universalFlatIndexFieldMetadatas: [
    { fieldMetadataUniversalIdentifier: TARGET_PERSON_LEG_UID },
  ],
};

const mockStandardMaps = ({
  fields = [standardTargetPersonLeg, standardPersonForwardField],
  indexes = [standardPersonIdIndex],
  objects = [timelineActivityObject, personObject],
}: {
  fields?: { universalIdentifier: string }[];
  indexes?: { universalIdentifier: string }[];
  objects?: { universalIdentifier: string }[];
} = {}) => {
  computeTwentyStandardApplicationAllFlatEntityMapsMock.mockReturnValue({
    allFlatEntityMaps: {
      flatFieldMetadataMaps: buildByUniversalIdentifierMap(fields),
      flatIndexMaps: buildByUniversalIdentifierMap(indexes),
      flatObjectMetadataMaps: buildByUniversalIdentifierMap(objects),
    },
  });
};

describe('RestoreStandardDefaultRelationFieldsCommand', () => {
  let command: RestoreStandardDefaultRelationFieldsCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunLegacyWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    validateBuildAndRunLegacyWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    mockStandardMaps();

    command = new RestoreStandardDefaultRelationFieldsCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: STANDARD_APPLICATION,
          }),
      } as unknown as ApplicationService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunLegacyWorkspaceMigration:
          validateBuildAndRunLegacyWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    );
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  const mockWorkspaceCache = ({
    fields = [],
    indexes = [],
    objects = [timelineActivityObject, personObject],
  }: {
    fields?: {
      universalIdentifier: string;
      name: string;
      objectMetadataUniversalIdentifier: string;
    }[];
    indexes?: { universalIdentifier: string }[];
    objects?: { universalIdentifier: string }[];
  }) => {
    getOrRecomputeMock.mockResolvedValue({
      flatFieldMetadataMaps: buildByUniversalIdentifierMap(fields),
      flatIndexMaps: buildByUniversalIdentifierMap(indexes),
      flatObjectMetadataMaps: buildByUniversalIdentifierMap(objects),
    });
  };

  const getCreatedUniversalIdentifiers = () => {
    const [payload] =
      validateBuildAndRunLegacyWorkspaceMigrationMock.mock.calls[0];

    return {
      fields:
        payload.allFlatEntityOperationByMetadataName.fieldMetadata.flatEntityToCreate.map(
          ({ universalIdentifier }: { universalIdentifier: string }) =>
            universalIdentifier,
        ),
      indexes:
        payload.allFlatEntityOperationByMetadataName.index.flatEntityToCreate.map(
          ({ universalIdentifier }: { universalIdentifier: string }) =>
            universalIdentifier,
        ),
    };
  };

  it('recreates a missing default-relation pair with its index', async () => {
    mockWorkspaceCache({});

    await runOnWorkspace();

    expect(getCreatedUniversalIdentifiers()).toEqual({
      fields: [TARGET_PERSON_LEG_UID, PERSON_FORWARD_FIELD_UID],
      indexes: [PERSON_ID_INDEX_UID],
    });
  });

  it('does nothing when the pair already exists', async () => {
    const warnSpy = jest.spyOn(command['logger'], 'warn');

    mockWorkspaceCache({
      fields: [
        {
          universalIdentifier: TARGET_PERSON_LEG_UID,
          name: 'targetPerson',
          objectMetadataUniversalIdentifier: TIMELINE_ACTIVITY_OBJECT_UID,
        },
        {
          universalIdentifier: PERSON_FORWARD_FIELD_UID,
          name: 'timelineActivities',
          objectMetadataUniversalIdentifier: PERSON_OBJECT_UID,
        },
      ],
      indexes: [{ universalIdentifier: PERSON_ID_INDEX_UID }],
    });

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('skips and warns instead of recreating half of a pair when one member survives', async () => {
    const warnSpy = jest.spyOn(command['logger'], 'warn');

    mockWorkspaceCache({
      fields: [
        {
          universalIdentifier: TARGET_PERSON_LEG_UID,
          name: 'targetPerson',
          objectMetadataUniversalIdentifier: TIMELINE_ACTIVITY_OBJECT_UID,
        },
      ],
      indexes: [{ universalIdentifier: PERSON_ID_INDEX_UID }],
    });

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'timelineActivity.targetPerson / person.timelineActivities',
      ),
    );
  });

  it('skips the whole pair when a member name is taken by a drifted duplicate', async () => {
    mockWorkspaceCache({
      fields: [
        {
          universalIdentifier: 'drifted-duplicate-uid',
          name: 'targetPerson',
          objectMetadataUniversalIdentifier: TIMELINE_ACTIVITY_OBJECT_UID,
        },
      ],
    });

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('skips the whole pair when a member host object is missing', async () => {
    mockWorkspaceCache({
      objects: [timelineActivityObject],
    });

    await runOnWorkspace();

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });

  it('restores an intact pair when another pair is blocked', async () => {
    mockStandardMaps({
      fields: [
        standardTargetPersonLeg,
        standardPersonForwardField,
        standardTargetCompanyLeg,
        standardCompanyForwardField,
      ],
      objects: [timelineActivityObject, personObject, companyObject],
    });
    mockWorkspaceCache({
      fields: [
        {
          universalIdentifier: 'drifted-duplicate-uid',
          name: 'targetPerson',
          objectMetadataUniversalIdentifier: TIMELINE_ACTIVITY_OBJECT_UID,
        },
      ],
      objects: [timelineActivityObject, personObject, companyObject],
    });

    await runOnWorkspace();

    expect(getCreatedUniversalIdentifiers()).toEqual({
      fields: [TARGET_COMPANY_LEG_UID, COMPANY_FORWARD_FIELD_UID],
      indexes: [],
    });
  });

  it('does not run the migration on dry run', async () => {
    mockWorkspaceCache({});

    await runOnWorkspace(true);

    expect(
      validateBuildAndRunLegacyWorkspaceMigrationMock,
    ).not.toHaveBeenCalled();
  });
});
