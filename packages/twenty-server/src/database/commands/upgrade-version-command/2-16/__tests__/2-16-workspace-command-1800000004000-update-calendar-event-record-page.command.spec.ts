import { Test, type TestingModule } from '@nestjs/testing';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { UpdateCalendarEventRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1800000004000-update-calendar-event-record-page.command';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';

const CALENDAR_EVENT_RECORD_PAGE_UUIDS = {
  view: 'c73668d1-022d-4eaf-b825-4e2548180db6',
  participantsWidget: '6faea537-02fa-4993-957c-f2e1654986bd',
  auditViewFields: {
    createdAt: '0d875e4e-ad0e-49d6-9646-baf1b3e664f5',
    createdBy: '4d9bdb2b-c5e1-4e21-9444-c9a5aaadd508',
    updatedAt: 'e71c7f12-c715-4109-a5c7-db389af3ce71',
    updatedBy: '3afee826-632d-4a47-b210-7dea75ebb12d',
  },
} as const;

const buildEntity = (universalIdentifier: string) => ({
  id: `id-${universalIdentifier}`,
  universalIdentifier,
});

const buildFlatEntityMaps = (universalIdentifiers: string[]) => {
  const byUniversalIdentifier = Object.fromEntries(
    universalIdentifiers.map((universalIdentifier) => [
      universalIdentifier,
      buildEntity(universalIdentifier),
    ]),
  );
  const byId = Object.fromEntries(
    Object.values(byUniversalIdentifier).map((entity) => [entity.id, entity]),
  );
  const universalIdentifierById = Object.fromEntries(
    Object.values(byUniversalIdentifier).map((entity) => [
      entity.id,
      entity.universalIdentifier,
    ]),
  );

  return { byUniversalIdentifier, byId, universalIdentifierById };
};

const buildCache = ({
  hasView,
  hasParticipantsWidget,
  hasAuditViewFields,
}: {
  hasView: boolean;
  hasParticipantsWidget: boolean;
  hasAuditViewFields: boolean;
}) => ({
  flatViewMaps: buildFlatEntityMaps(
    hasView ? [CALENDAR_EVENT_RECORD_PAGE_UUIDS.view] : [],
  ),
  flatViewFieldMaps: buildFlatEntityMaps(
    hasAuditViewFields
      ? Object.values(CALENDAR_EVENT_RECORD_PAGE_UUIDS.auditViewFields)
      : [],
  ),
  flatPageLayoutWidgetMaps: buildFlatEntityMaps(
    hasParticipantsWidget
      ? [CALENDAR_EVENT_RECORD_PAGE_UUIDS.participantsWidget]
      : [],
  ),
});

describe('UpdateCalendarEventRecordPageCommand', () => {
  let command: UpdateCalendarEventRecordPageCommand;
  let workspaceCacheService: jest.Mocked<WorkspaceCacheService>;
  let workspaceMigrationValidateBuildAndRunService: jest.Mocked<WorkspaceMigrationValidateBuildAndRunService>;
  let applicationService: jest.Mocked<ApplicationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCalendarEventRecordPageCommand,
        {
          provide: WorkspaceIteratorService,
          useValue: {},
        },
        {
          provide: ApplicationService,
          useValue: {
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
              .fn()
              .mockResolvedValue({
                twentyStandardFlatApplication: {
                  id: 'standard-app-id',
                  universalIdentifier: 'standard-app-universal-id',
                },
              }),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn(),
          },
        },
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: {
            validateBuildAndRunWorkspaceMigration: jest.fn(),
          },
        },
      ],
    }).compile();

    command = module.get(UpdateCalendarEventRecordPageCommand);
    workspaceCacheService = module.get(WorkspaceCacheService);
    workspaceMigrationValidateBuildAndRunService = module.get(
      WorkspaceMigrationValidateBuildAndRunService,
    );
    applicationService = module.get(ApplicationService);
  });

  it('deletes the participant widget and creates the audit view fields when both changes are needed', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buildCache({
        hasView: true,
        hasParticipantsWidget: true,
        hasAuditViewFields: false,
      }) as any,
    );
    workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { status: 'success' } as any,
    );

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    expect(
      workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
    ).toHaveBeenCalledTimes(1);

    const [args] =
      workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mock
        .calls[0];

    expect(args.workspaceId).toBe(WORKSPACE_ID);
    expect(args.applicationUniversalIdentifier).toBe(
      'standard-app-universal-id',
    );

    const operations = args.allFlatEntityOperationByMetadataName;

    expect(operations.pageLayoutWidget?.flatEntityToDelete).toHaveLength(1);
    expect(operations.pageLayoutWidget?.flatEntityToCreate).toEqual([]);
    expect(operations.viewField?.flatEntityToCreate).toHaveLength(4);
    expect(operations.viewField?.flatEntityToDelete).toEqual([]);
  });

  it('skips entirely when the record page view does not exist', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buildCache({
        hasView: false,
        hasParticipantsWidget: false,
        hasAuditViewFields: false,
      }) as any,
    );

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    expect(
      workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
    ).not.toHaveBeenCalled();
    expect(
      applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow,
    ).not.toHaveBeenCalled();
  });

  it('only creates the audit view fields when the participant widget is already gone', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buildCache({
        hasView: true,
        hasParticipantsWidget: false,
        hasAuditViewFields: false,
      }) as any,
    );
    workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { status: 'success' } as any,
    );

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    const [args] =
      workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mock
        .calls[0];

    const operations = args.allFlatEntityOperationByMetadataName;

    expect(operations.pageLayoutWidget?.flatEntityToDelete).toHaveLength(0);
    expect(operations.viewField?.flatEntityToCreate).toHaveLength(4);
  });

  it('only deletes the participant widget when the audit view fields already exist', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buildCache({
        hasView: true,
        hasParticipantsWidget: true,
        hasAuditViewFields: true,
      }) as any,
    );
    workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { status: 'success' } as any,
    );

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    const [args] =
      workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mock
        .calls[0];

    const operations = args.allFlatEntityOperationByMetadataName;

    expect(operations.pageLayoutWidget?.flatEntityToDelete).toHaveLength(1);
    expect(operations.viewField?.flatEntityToCreate).toHaveLength(0);
  });

  it('does nothing when the record page is already up to date', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buildCache({
        hasView: true,
        hasParticipantsWidget: false,
        hasAuditViewFields: true,
      }) as any,
    );

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    expect(
      workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
    ).not.toHaveBeenCalled();
  });

  it('skips the migration call in dry-run mode', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buildCache({
        hasView: true,
        hasParticipantsWidget: true,
        hasAuditViewFields: false,
      }) as any,
    );

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun: true },
      index: 0,
      total: 1,
    });

    expect(
      workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
    ).not.toHaveBeenCalled();
  });

  it('throws when the workspace migration build fails', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buildCache({
        hasView: true,
        hasParticipantsWidget: true,
        hasAuditViewFields: false,
      }) as any,
    );
    workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { status: 'fail', errors: ['something went wrong'] } as any,
    );

    await expect(
      command.runOnWorkspace({
        workspaceId: WORKSPACE_ID,
        options: {},
        index: 0,
        total: 1,
      }),
    ).rejects.toThrow(
      `Failed to update CalendarEvent record page for workspace ${WORKSPACE_ID}`,
    );
  });
});
