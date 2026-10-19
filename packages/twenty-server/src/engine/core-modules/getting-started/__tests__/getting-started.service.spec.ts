import { GettingStartedService } from 'src/engine/core-modules/getting-started/services/getting-started.service';
import { UpdateGettingStartedInput } from 'src/engine/core-modules/getting-started/dtos/update-getting-started.input';
import { validate } from 'class-validator';

const scope = {
  userId: 'user-a',
  workspaceId: 'workspace-a',
  userWorkspaceId: 'membership-a',
};
const buildService = () => {
  const values = new Map<string, unknown>();
  const vars = {
    getAll: jest.fn(async () => new Map(values)),
    set: jest.fn(async ({ key, value }) => {
      values.set(key, value);
    }),
  };
  const accounts = { exists: jest.fn().mockResolvedValue(false) };
  const credits = { find: jest.fn().mockResolvedValue([]) };
  const workflows = { exists: jest.fn().mockResolvedValue(false) };
  const apps = { exists: jest.fn().mockResolvedValue(false) };
  const service = new GettingStartedService(
    vars as never,
    accounts as never,
    credits as never,
    workflows as never,
    apps as never,
  );
  return { service, vars, values, accounts, credits, workflows, apps };
};

describe('Getting started progress', () => {
  it('persists completion independently of selection and snooze', async () => {
    const { service, vars } = buildService();
    await service.updateProgress(scope, { completedStep: 'importData' });
    const result = await service.updateProgress(scope, {
      selectedStep: 'inviteTeam',
      snoozedUntil: '2026-12-01T00:00:00Z',
    });
    expect(result.completedSteps).toEqual(['importData']);
    expect(result.selectedStep).toBe('inviteTeam');
    expect(vars.set).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-a',
        workspaceId: 'workspace-a',
        key: 'gettingStarted.completed.importData',
        value: true,
      }),
    );
  });
  it('counts an existing mailbox belonging to this membership', async () => {
    const { service, accounts } = buildService();
    accounts.exists.mockResolvedValue(true);
    expect((await service.getProgress(scope)).completedSteps).toContain(
      'connectMailbox',
    );
    expect(accounts.exists).toHaveBeenCalledWith({
      where: expect.objectContaining({
        workspaceId: 'workspace-a',
        userWorkspaceId: 'membership-a',
      }),
    });
    accounts.exists.mockResolvedValue(false);
    expect((await service.getProgress(scope)).completedSteps).toContain(
      'connectMailbox',
    );
  });
  it('uses ledger rewards without adding a completion bonus', async () => {
    const { service, credits } = buildService();
    credits.find.mockResolvedValue([
      { amountMicro: 1_000_000 },
      { amountMicro: 500_000 },
      { amountMicro: 500_000 },
    ]);
    expect(
      (await service.updateProgress(scope, { completedStep: 'followUpDeals' }))
        .creditsEarned,
    ).toBe(2);
    expect(credits.find).toHaveBeenCalledWith(scope.workspaceId, {
      where: expect.arrayContaining([
        expect.objectContaining({ workspaceId: 'workspace-a' }),
      ]),
    });
  });
  it('ignores invalid saved selection and rejects unknown step input', async () => {
    const { service, values } = buildService();
    values.set('gettingStarted.selectedStep', 'obsolete');
    expect((await service.getProgress(scope)).selectedStep).toBeNull();
    const invalid = Object.assign(new UpdateGettingStartedInput(), {
      completedStep: 'workspaceSetup',
      snoozedUntil: 'tomorrow',
    });
    expect(
      (await validate(invalid)).map((error) => error.property).sort(),
    ).toEqual(['completedStep', 'snoozedUntil']);
  });
});
