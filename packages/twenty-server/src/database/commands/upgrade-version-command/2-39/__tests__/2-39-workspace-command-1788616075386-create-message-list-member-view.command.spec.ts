import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { CreateMessageListMemberViewCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788616075386-create-message-list-member-view.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

jest.mock(
  'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant',
);

const computeTwentyStandardApplicationAllFlatEntityMapsMock = jest.mocked(
  computeTwentyStandardApplicationAllFlatEntityMaps,
);

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};

const LIST_MEMBER = STANDARD_OBJECTS.messageListMember;
const LIST_MEMBER_VIEW_UNIVERSAL_IDENTIFIER =
  LIST_MEMBER.views.allMessageListMembers.universalIdentifier;
const LIST_MEMBER_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = Object.values(
  LIST_MEMBER.views.allMessageListMembers.viewFields,
).map((viewField) => viewField.universalIdentifier);

const buildByUniversalIdentifierMap = (universalIdentifiers: string[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    universalIdentifiers.map((universalIdentifier) => [
      universalIdentifier,
      { universalIdentifier },
    ]),
  ),
});

describe('CreateMessageListMemberViewCommand', () => {
  let command: CreateMessageListMemberViewCommand;
  let findApplicationMock: jest.Mock;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    findApplicationMock = jest.fn().mockResolvedValue({
      twentyStandardFlatApplication: STANDARD_APPLICATION,
    });
    getOrRecomputeMock = jest.fn();
    validateBuildAndRunWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    computeTwentyStandardApplicationAllFlatEntityMapsMock.mockReturnValue({
      allFlatEntityMaps: {
        flatViewMaps: buildByUniversalIdentifierMap([
          LIST_MEMBER_VIEW_UNIVERSAL_IDENTIFIER,
        ]),
        flatViewFieldMaps: buildByUniversalIdentifierMap(
          LIST_MEMBER_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
        ),
      },
    } as unknown as ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >);

    command = new CreateMessageListMemberViewCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow:
          findApplicationMock,
      } as unknown as ApplicationService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunWorkspaceMigration:
          validateBuildAndRunWorkspaceMigrationMock,
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
    existingObjects = [LIST_MEMBER.universalIdentifier],
    existingViews = [],
    existingViewFields = [],
  }: {
    existingObjects?: string[];
    existingViews?: string[];
    existingViewFields?: string[];
  }) => {
    getOrRecomputeMock.mockResolvedValue({
      flatObjectMetadataMaps: buildByUniversalIdentifierMap(existingObjects),
      flatViewMaps: buildByUniversalIdentifierMap(existingViews),
      flatViewFieldMaps: buildByUniversalIdentifierMap(existingViewFields),
    });
  };

  it('creates the message list member view and all view fields when missing', async () => {
    mockWorkspaceCache({});

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).toHaveBeenCalledWith({
      isSystemBuild: true,
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: STANDARD_APPLICATION.universalIdentifier,
      allFlatEntityOperationByMetadataName: {
        view: {
          flatEntityToCreate: [
            expect.objectContaining({
              universalIdentifier: LIST_MEMBER_VIEW_UNIVERSAL_IDENTIFIER,
            }),
          ],
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
        viewField: {
          flatEntityToCreate: LIST_MEMBER_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.map(
            (universalIdentifier) =>
              expect.objectContaining({ universalIdentifier }),
          ),
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
      },
    });
  });

  it('creates missing view fields when the view already exists', async () => {
    mockWorkspaceCache({
      existingViews: [LIST_MEMBER_VIEW_UNIVERSAL_IDENTIFIER],
      existingViewFields: [
        LIST_MEMBER.views.allMessageListMembers.viewFields.id
          .universalIdentifier,
      ],
    });

    await runOnWorkspace();

    const payload =
      validateBuildAndRunWorkspaceMigrationMock.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName;

    expect(payload.view.flatEntityToCreate).toEqual([]);
    expect(payload.viewField.flatEntityToCreate).toEqual(
      LIST_MEMBER_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.slice(1).map(
        (universalIdentifier) =>
          expect.objectContaining({ universalIdentifier }),
      ),
    );
  });

  it('does nothing when the view and view fields already exist', async () => {
    mockWorkspaceCache({
      existingViews: [LIST_MEMBER_VIEW_UNIVERSAL_IDENTIFIER],
      existingViewFields: LIST_MEMBER_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
    });

    await runOnWorkspace();

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('does not write metadata in dry-run mode', async () => {
    mockWorkspaceCache({});

    await runOnWorkspace(true);

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('skips workspaces where the messageListMember object is absent', async () => {
    mockWorkspaceCache({ existingObjects: [] });

    await runOnWorkspace();

    expect(findApplicationMock).not.toHaveBeenCalled();
    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('throws when the migration fails', async () => {
    mockWorkspaceCache({});
    validateBuildAndRunWorkspaceMigrationMock.mockResolvedValue({
      status: 'fail',
      errors: [],
    });

    await expect(runOnWorkspace()).rejects.toThrow(
      `Failed to create messageListMember view for workspace ${WORKSPACE_ID}`,
    );
  });
});
