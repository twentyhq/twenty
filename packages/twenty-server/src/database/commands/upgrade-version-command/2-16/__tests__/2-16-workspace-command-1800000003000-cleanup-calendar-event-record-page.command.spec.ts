import { Test, type TestingModule } from '@nestjs/testing';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { CleanupCalendarEventRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1800000003000-cleanup-calendar-event-record-page.command';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';

const CALENDAR_EVENT_RECORD_PAGE_UUIDS = {
  pageLayout: 'b9b10e40-9ce2-4704-8ac6-c6e92e2563c1',
  tabs: {
    home: 'c80a0407-25f5-438b-8c32-1ce9cde95657',
    timeline: '9cb35d6d-932d-49bc-b303-593116ca5343',
  },
  widgets: {
    fields: 'fea5c1c2-0c1d-4d2e-a14c-a10108b0db0f',
    participants: '6faea537-02fa-4993-957c-f2e1654986bd',
    callRecordings: 'f473b435-e2d4-4928-8d90-1db0094389f7',
    timeline: '8273e2c4-cc17-4d3e-ba08-5bac612b5d44',
  },
  view: 'c73668d1-022d-4eaf-b825-4e2548180db6',
  viewFieldGroups: {
    general: 'aeadeb9e-3673-4c0c-8845-f59cb1e6ca42',
    system: 'eb1aadeb-7feb-44d1-9f9a-e9929e8690fc',
  },
  viewFields: {
    title: 'd17fc76f-2c3a-4c84-8249-27227bf71638',
    startsAt: '7bbd3744-d870-4704-882c-071732ed23d9',
    endsAt: 'ed7ca7e9-c8b3-4516-be4c-6491a27af847',
    isFullDay: '5d8f89b7-ec9e-41d6-9efe-96f9c32e6c20',
    isCanceled: 'a01f490d-cf67-4458-801e-13d81e74b45a',
    conferenceLink: '5ad748ae-e1bb-47bb-ac34-d82663c31b6e',
    location: '66c73e74-56e6-40c3-b776-0081ee757b8a',
    description: 'a09449be-b23f-48d4-b0dc-0bd36813220a',
    externalCreatedAt: '689c3eba-bedf-4a52-b9f1-3e34ce718251',
    externalUpdatedAt: '7823fa45-8cba-47ba-8dfb-5841bef44fc6',
    iCalUid: '8be763dd-6217-47fb-a7d2-ac223af881d2',
    conferenceSolution: '795905b6-c6f8-42cf-b8ea-3e5b6d32145f',
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

const FULLY_SEEDED_CACHE = {
  flatViewMaps: buildFlatEntityMaps([CALENDAR_EVENT_RECORD_PAGE_UUIDS.view]),
  flatViewFieldMaps: buildFlatEntityMaps(
    Object.values(CALENDAR_EVENT_RECORD_PAGE_UUIDS.viewFields),
  ),
  flatViewFieldGroupMaps: buildFlatEntityMaps(
    Object.values(CALENDAR_EVENT_RECORD_PAGE_UUIDS.viewFieldGroups),
  ),
  flatPageLayoutMaps: buildFlatEntityMaps([
    CALENDAR_EVENT_RECORD_PAGE_UUIDS.pageLayout,
  ]),
  flatPageLayoutTabMaps: buildFlatEntityMaps(
    Object.values(CALENDAR_EVENT_RECORD_PAGE_UUIDS.tabs),
  ),
  flatPageLayoutWidgetMaps: buildFlatEntityMaps(
    Object.values(CALENDAR_EVENT_RECORD_PAGE_UUIDS.widgets),
  ),
};

const EMPTY_CACHE = {
  flatViewMaps: buildFlatEntityMaps([]),
  flatViewFieldMaps: buildFlatEntityMaps([]),
  flatViewFieldGroupMaps: buildFlatEntityMaps([]),
  flatPageLayoutMaps: buildFlatEntityMaps([]),
  flatPageLayoutTabMaps: buildFlatEntityMaps([]),
  flatPageLayoutWidgetMaps: buildFlatEntityMaps([]),
};

describe('CleanupCalendarEventRecordPageCommand', () => {
  let command: CleanupCalendarEventRecordPageCommand;
  let workspaceCacheService: jest.Mocked<WorkspaceCacheService>;
  let workspaceMigrationValidateBuildAndRunService: jest.Mocked<WorkspaceMigrationValidateBuildAndRunService>;
  let applicationService: jest.Mocked<ApplicationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CleanupCalendarEventRecordPageCommand,
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

    command = module.get(CleanupCalendarEventRecordPageCommand);
    workspaceCacheService = module.get(WorkspaceCacheService);
    workspaceMigrationValidateBuildAndRunService = module.get(
      WorkspaceMigrationValidateBuildAndRunService,
    );
    applicationService = module.get(ApplicationService);
  });

  it('deletes the page layout, view and all related tabs/widgets/fields when present', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      FULLY_SEEDED_CACHE as any,
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

    expect(operations.pageLayout?.flatEntityToDelete).toHaveLength(1);
    expect(operations.pageLayoutTab?.flatEntityToDelete).toHaveLength(2);
    expect(operations.pageLayoutWidget?.flatEntityToDelete).toHaveLength(4);
    expect(operations.view?.flatEntityToDelete).toHaveLength(1);
    expect(operations.viewFieldGroup?.flatEntityToDelete).toHaveLength(2);
    expect(operations.viewField?.flatEntityToDelete).toHaveLength(12);

    for (const operation of Object.values(operations)) {
      expect(operation?.flatEntityToCreate).toEqual([]);
      expect(operation?.flatEntityToUpdate).toEqual([]);
    }
  });

  it('does nothing when none of the metadata is present', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      EMPTY_CACHE as any,
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

  it('only deletes the metadata that actually exists in the workspace', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {
        ...EMPTY_CACHE,
        flatPageLayoutWidgetMaps: buildFlatEntityMaps([
          CALENDAR_EVENT_RECORD_PAGE_UUIDS.widgets.participants,
        ]),
      } as any,
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

    expect(args.allFlatEntityOperationByMetadataName.pageLayoutWidget?.flatEntityToDelete).toHaveLength(1);
    expect(args.allFlatEntityOperationByMetadataName.pageLayout?.flatEntityToDelete).toHaveLength(0);
    expect(args.allFlatEntityOperationByMetadataName.view?.flatEntityToDelete).toHaveLength(0);
  });

  it('skips the migration call in dry-run mode', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      FULLY_SEEDED_CACHE as any,
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
      FULLY_SEEDED_CACHE as any,
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
      `Failed to clean up CalendarEvent record page metadata for workspace ${WORKSPACE_ID}`,
    );
  });
});
