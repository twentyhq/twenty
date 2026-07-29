import { CommandShutdownService } from 'src/database/commands/command-runners/command-shutdown.service';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

const WORKSPACE_IDS = ['workspace-1', 'workspace-2', 'workspace-3'];

describe('WorkspaceIteratorService shutdown handling', () => {
  let service: WorkspaceIteratorService;
  let isShutdownRequested: jest.Mock<boolean, []>;

  beforeEach(() => {
    isShutdownRequested = jest.fn().mockReturnValue(false);

    const commandShutdownService = {
      isShutdownRequested,
      listenToShutdownSignals: jest.fn(),
    } as unknown as CommandShutdownService;

    const workspaceRepository = {
      findOne: jest.fn().mockResolvedValue({ databaseSchema: 'schema' }),
      find: jest.fn().mockResolvedValue([]),
    };

    const globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(async (run: () => Promise<void>) =>
        run(),
      ),
      getGlobalWorkspaceDataSource: jest.fn().mockResolvedValue({}),
    } as unknown as GlobalWorkspaceOrmManager;

    service = new WorkspaceIteratorService(
      // oxlint-disable-next-line typescript/no-explicit-any
      workspaceRepository as any,
      globalWorkspaceOrmManager,
      commandShutdownService,
    );

    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
  });

  it('should process every workspace and not report an interruption when no shutdown is requested', async () => {
    const callback = jest.fn().mockResolvedValue(undefined);

    const report = await service.iterate({
      workspaceIds: WORKSPACE_IDS,
      callback,
    });

    expect(callback).toHaveBeenCalledTimes(3);
    expect(report.success).toHaveLength(3);
    expect(report.interrupted).toBe(false);
  });

  it('should stop before the next workspace and report an interruption when a shutdown is requested', async () => {
    const callback = jest.fn().mockResolvedValue(undefined);

    isShutdownRequested.mockReturnValueOnce(false).mockReturnValue(true);

    const report = await service.iterate({
      workspaceIds: WORKSPACE_IDS,
      callback,
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: 'workspace-1' }),
    );
    expect(report.success).toEqual([{ workspaceId: 'workspace-1' }]);
    expect(report.interrupted).toBe(true);
  });

  it('should not report an interruption when the shutdown lands on the last workspace', async () => {
    const callback = jest.fn().mockResolvedValue(undefined);

    isShutdownRequested.mockReturnValue(false);
    callback.mockImplementation(async ({ workspaceId }) => {
      if (workspaceId === 'workspace-3') {
        isShutdownRequested.mockReturnValue(true);
      }
    });

    const report = await service.iterate({
      workspaceIds: WORKSPACE_IDS,
      callback,
    });

    expect(callback).toHaveBeenCalledTimes(3);
    expect(report.success).toHaveLength(3);
    expect(report.interrupted).toBe(false);
  });

  it('should not report an interruption when there is no workspace to process', async () => {
    const callback = jest.fn();

    const report = await service.iterate({ workspaceIds: [], callback });

    expect(callback).not.toHaveBeenCalled();
    expect(report.interrupted).toBe(false);
  });
});
