jest.mock(
  'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service',
  () => ({ CoreWorkflowMutationWorkspaceService: class {} }),
);
jest.mock(
  'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service',
  () => ({ CoreWorkflowLifecycleWorkspaceService: class {} }),
);
import { GettingStartedHandoverResolver } from 'src/engine/core-modules/getting-started/getting-started-handover.resolver';

const buildResolver = () => {
  let saved: unknown;
  let active = false;
  const create = jest
    .fn()
    .mockResolvedValue({
      coreWorkflow: { id: 'workflow' },
      coreWorkflowVersionId: 'version',
    });
  const activate = jest.fn(async () => {
    active = true;
  });
  const completeStep = jest.fn();
  const accounts = { findOne: jest.fn().mockResolvedValue({ id: 'mailbox' }) };
  const resolver = new GettingStartedHandoverResolver(
    {
      get: async () => saved,
      set: async ({ value }: { value: unknown }) => {
        saved = value;
      },
    } as never,
    { withLock: async (run: () => Promise<unknown>) => run() } as never,
    { createWorkflowWithContent: create } as never,
    { activateCoreWorkflowVersion: activate } as never,
    {
      getFlatEntityMaps: async () => ({
        objectIdByNameSingular: {
          company: 'company-object',
          workspaceMember: 'member-object',
        },
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {
            companyId: {
              id: 'company-field',
              name: 'id',
              objectMetadataId: 'company-object',
            },
            memberId: {
              id: 'member-field',
              name: 'id',
              objectMetadataId: 'member-object',
            },
          },
        },
      }),
    } as never,
    { completeStep } as never,
    {
      exists: async () => true,
      findOne: async () => (active ? { id: 'version' } : null),
    } as never,
    accounts as never,
  );
  const prepare = (shouldActivate: boolean) =>
    resolver.prepareGettingStartedHandover(
      { id: 'user' } as never,
      { id: 'workspace' } as never,
      'membership',
      shouldActivate,
    );
  return { prepare, create, activate, completeStep, accounts };
};

describe('Getting started handover preparation', () => {
  it('reuses the draft and activates it only once on retries', async () => {
    const { prepare, create, activate, completeStep } = buildResolver();
    expect(await prepare(false)).toEqual({
      workflowId: 'workflow',
      versionId: 'version',
    });
    await prepare(false);
    expect(completeStep).not.toHaveBeenCalled();
    await prepare(true);
    await prepare(true);
    expect(create).toHaveBeenCalledTimes(1);
    expect(activate).toHaveBeenCalledTimes(1);
    expect(completeStep).toHaveBeenCalledWith(
      { userId: 'user', workspaceId: 'workspace' },
      'handoverDeals',
    );
  });
  it('does not mark completion when activation fails', async () => {
    const { prepare, activate, completeStep } = buildResolver();
    activate.mockRejectedValueOnce(new Error('Invalid workflow'));
    await expect(prepare(true)).rejects.toThrow('Invalid workflow');
    expect(completeStep).not.toHaveBeenCalled();
  });
  it('requires the current member to have a connected mailbox', async () => {
    const { prepare, accounts, create } = buildResolver();
    accounts.findOne.mockResolvedValue(null);
    await expect(prepare(false)).rejects.toThrow('Connect a mailbox');
    expect(accounts.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          workspaceId: 'workspace',
          userWorkspaceId: 'membership',
        }),
      }),
    );
    expect(create).not.toHaveBeenCalled();
  });
});
