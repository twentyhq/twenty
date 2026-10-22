import { act, renderHook } from '@testing-library/react';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { Provider as JotaiProvider } from 'jotai';
import { ConnectedAccountProvider } from 'twenty-shared/types';

const mockGetUpdatableWorkflowVersion = jest.fn();
const mockCreateWorkflowVersionStep = jest.fn().mockResolvedValue({
  data: {
    createWorkflowVersionStep: {
      stepsDiff: [
        {
          type: 'CREATE',
          path: ['steps', 0],
          value: { id: 'step-id', type: 'CODE' },
        },
      ],
    },
  },
});

jest.mock(
  '@/workflow/workflow-steps/hooks/useCreateWorkflowVersionStep',
  () => ({
    useCreateWorkflowVersionStep: () => ({
      createWorkflowVersionStep: mockCreateWorkflowVersionStep,
    }),
  }),
);

jest.mock('@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow', () => ({
  useGetUpdatableWorkflowVersionOrThrow: () => ({
    getUpdatableWorkflowVersion: mockGetUpdatableWorkflowVersion,
  }),
}));

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: () => 'step-id',
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const workflowVisualizerComponentInstanceId =
    'workflow-visualizer-instance-id';

  return (
    <JotaiProvider store={jotaiStore}>
      <WorkflowVisualizerComponentInstanceContext.Provider
        value={{
          instanceId: workflowVisualizerComponentInstanceId,
        }}
      >
        {children}
      </WorkflowVisualizerComponentInstanceContext.Provider>
    </JotaiProvider>
  );
};

describe('useCreateStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jotaiStore.set(myConnectedAccountsState.atom, null);
    jotaiStore.set(currentWorkspaceState.atom, null);
  });

  it('should create step in workflow version', async () => {
    const mockWorkflowVersionId = 'version-123';
    mockGetUpdatableWorkflowVersion.mockResolvedValue(mockWorkflowVersionId);

    const { result } = renderHook(() => useCreateStep(), {
      wrapper,
    });

    await act(async () => {
      await result.current.createStep({
        newStepType: 'CODE',
        parentStepId: 'parent-step-id',
        nextStepId: undefined,
      });
    });

    expect(mockGetUpdatableWorkflowVersion).toHaveBeenCalled();
    expect(mockCreateWorkflowVersionStep).toHaveBeenCalledWith({
      id: 'step-id',
      workflowVersionId: mockWorkflowVersionId,
      stepType: 'CODE',
      parentStepId: 'parent-step-id',
      nextStepId: undefined,
      parentStepConnectionOptions: undefined,
      position: undefined,
    });
  });

  describe('send email default sender', () => {
    const seedSenderState = (workspaceSenderDomain: string) => {
      jotaiStore.set(myConnectedAccountsState.atom, [
        {
          id: 'account-id',
          handle: 'michael@example.com',
          handleAliases: ['michael@getindexed.ai'],
          provider: ConnectedAccountProvider.GOOGLE,
          connectionParameters: null,
        },
      ] as never);
      jotaiStore.set(currentWorkspaceState.atom, {
        defaultSenderDomain: workspaceSenderDomain,
      } as never);
    };

    const createSendEmailStep = async (
      defaultSettings?: Record<string, unknown>,
    ) => {
      mockGetUpdatableWorkflowVersion.mockResolvedValue('version-123');
      const { result } = renderHook(() => useCreateStep(), { wrapper });

      await act(async () => {
        await result.current.createStep({
          newStepType: 'SEND_EMAIL',
          parentStepId: undefined,
          nextStepId: undefined,
          defaultSettings,
        });
      });
    };

    it('should start on the workspace default sender', async () => {
      seedSenderState('getindexed.ai');

      await createSendEmailStep();

      expect(mockCreateWorkflowVersionStep).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultSettings: {
            input: {
              connectedAccountId: 'account-id',
              fromHandle: 'michael@getindexed.ai',
            },
          },
        }),
      );
    });

    it('should leave default settings untouched without a matching sender', async () => {
      seedSenderState('other.com');

      await createSendEmailStep();

      expect(
        mockCreateWorkflowVersionStep.mock.calls[0][0].defaultSettings,
      ).toBeUndefined();
    });

    it('should not override caller provided input', async () => {
      seedSenderState('getindexed.ai');
      const defaultSettings = { input: { subject: 'Hi' } };

      await createSendEmailStep(defaultSettings);

      expect(
        mockCreateWorkflowVersionStep.mock.calls[0][0].defaultSettings,
      ).toEqual(defaultSettings);
    });

    it('should not apply the sender to other step types', async () => {
      seedSenderState('getindexed.ai');
      mockGetUpdatableWorkflowVersion.mockResolvedValue('version-123');
      const { result } = renderHook(() => useCreateStep(), { wrapper });

      await act(async () => {
        await result.current.createStep({
          newStepType: 'CODE',
          parentStepId: undefined,
          nextStepId: undefined,
        });
      });

      expect(
        mockCreateWorkflowVersionStep.mock.calls[0][0].defaultSettings,
      ).toBeUndefined();
    });
  });
});
