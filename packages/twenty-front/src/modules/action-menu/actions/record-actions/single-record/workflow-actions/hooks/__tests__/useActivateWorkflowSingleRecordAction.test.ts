import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndContextStoreWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { useActivateWorkflowSingleRecordAction } from '../useActivateWorkflowSingleRecordAction';

const workflowMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'workflow',
)!;

const baseWorkflowMock = {
  __typename: 'Workflow',
  id: 'workflowId',
  currentVersion: {
    __typename: 'WorkflowVersion',
    id: 'currentVersionId',
    trigger: 'trigger',
    steps: [
      {
        __typename: 'WorkflowStep',
        id: 'stepId1',
      },
    ],
  },
};

const draftWorkflowMock = {
  ...baseWorkflowMock,
  currentVersion: {
    ...baseWorkflowMock.currentVersion,
    status: 'DRAFT',
  },
  versions: [
    {
      __typename: 'WorkflowVersion',
      id: 'currentVersionId',
      status: 'DRAFT',
    },
  ],
};

const activeWorkflowMock = {
  ...baseWorkflowMock,
  currentVersion: {
    ...baseWorkflowMock.currentVersion,
    status: 'ACTIVE',
  },
  versions: [
    {
      __typename: 'WorkflowVersion',
      id: 'currentVersionId',
      status: 'ACTIVE',
    },
  ],
};

const noStepsWorkflowMock = {
  ...baseWorkflowMock,
  currentVersion: {
    ...baseWorkflowMock.currentVersion,
    steps: [],
  },
  versions: [
    {
      __typename: 'WorkflowVersion',
      id: 'currentVersionId',
      status: 'ACTIVE',
    },
  ],
};

const noTriggerWorkflowMock = {
  ...baseWorkflowMock,
  currentVersion: {
    ...baseWorkflowMock.currentVersion,
    trigger: undefined,
  },
  versions: [
    {
      __typename: 'WorkflowVersion',
      id: 'currentVersionId',
      status: 'ACTIVE',
    },
  ],
};

jest.mock('@/workflow/hooks/useWorkflowWithCurrentVersion', () => ({
  useWorkflowWithCurrentVersion: jest.fn(),
}));

const activateWorkflowVersionMock = jest.fn();

jest.mock('@/workflow/hooks/useActivateWorkflowVersion', () => ({
  useActivateWorkflowVersion: () => ({
    activateWorkflowVersion: activateWorkflowVersionMock,
  }),
}));

const createWrapper = (workflow: {
  __typename: string;
  id: string;
  currentVersion: {
    id: string;
  };
}) =>
  getJestMetadataAndApolloMocksAndActionMenuWrapper({
    apolloMocks: [],
    componentInstanceId: '1',
    contextStoreCurrentObjectMetadataNameSingular:
      workflowMockObjectMetadataItem.nameSingular,
    contextStoreTargetedRecordsRule: {
      mode: 'selection',
      selectedRecordIds: [workflow.id],
    },
    onInitializeRecoilSnapshot: (snapshot) => {
      snapshot.set(recordStoreFamilyState(workflow.id), workflow);
    },
  });

describe('useActivateWorkflowSingleRecordAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be registered when workflow has trigger and steps and is not active', () => {
    (useWorkflowWithCurrentVersion as jest.Mock).mockReturnValue(
      draftWorkflowMock,
    );

    const { result } = renderHook(
      () => useActivateWorkflowSingleRecordAction(),
      {
        wrapper: createWrapper(draftWorkflowMock),
      },
    );

    expect(result.current.shouldBeRegistered).toBe(true);
  });

  it('should not be registered when workflow is already active', () => {
    (useWorkflowWithCurrentVersion as jest.Mock).mockReturnValue(
      activeWorkflowMock,
    );

    const { result } = renderHook(
      () => useActivateWorkflowSingleRecordAction(),
      {
        wrapper: createWrapper(activeWorkflowMock),
      },
    );

    expect(result.current.shouldBeRegistered).toBe(false);
  });

  it('should not be registered when workflow has no steps', () => {
    (useWorkflowWithCurrentVersion as jest.Mock).mockReturnValue(
      noStepsWorkflowMock,
    );

    const { result } = renderHook(
      () => useActivateWorkflowSingleRecordAction(),
      {
        wrapper: createWrapper(noStepsWorkflowMock),
      },
    );

    expect(result.current.shouldBeRegistered).toBe(false);
  });

  it('should not be registered when workflow has no trigger', () => {
    (useWorkflowWithCurrentVersion as jest.Mock).mockReturnValue(
      noTriggerWorkflowMock,
    );

    const { result } = renderHook(
      () => useActivateWorkflowSingleRecordAction(),
      {
        wrapper: createWrapper(noTriggerWorkflowMock),
      },
    );

    expect(result.current.shouldBeRegistered).toBe(false);
  });

  it('should call activateWorkflowVersion on click', () => {
    (useWorkflowWithCurrentVersion as jest.Mock).mockReturnValue(
      draftWorkflowMock,
    );

    const { result } = renderHook(
      () => useActivateWorkflowSingleRecordAction(),
      {
        wrapper: createWrapper(draftWorkflowMock),
      },
    );

    act(() => {
      result.current.onClick();
    });

    expect(activateWorkflowVersionMock).toHaveBeenCalledWith({
      workflowId: draftWorkflowMock.id,
      workflowVersionId: draftWorkflowMock.currentVersion.id,
    });
  });

  it('should not call activateWorkflowVersion when not registered', () => {
    (useWorkflowWithCurrentVersion as jest.Mock).mockReturnValue(
      activeWorkflowMock,
    );

    const { result } = renderHook(
      () => useActivateWorkflowSingleRecordAction(),
      {
        wrapper: createWrapper(activeWorkflowMock),
      },
    );

    act(() => {
      result.current.onClick();
    });

    expect(activateWorkflowVersionMock).not.toHaveBeenCalled();
  });
});
