import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { useActivateWorkflowSingleRecordAction } from '../useActivateWorkflowSingleRecordAction';

const workflowMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'workflow',
)!;

const mockedWorkflowEnabledFeatureFlag = {
  id: '1',
  key: FeatureFlagKey.IsWorkflowEnabled,
  value: true,
  workspaceId: '1',
};

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
      snapshot.set(currentWorkspaceState, {
        ...mockCurrentWorkspace,
        featureFlags: [mockedWorkflowEnabledFeatureFlag],
      });
    },
  });

describe('useActivateWorkflowSingleRecordAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
