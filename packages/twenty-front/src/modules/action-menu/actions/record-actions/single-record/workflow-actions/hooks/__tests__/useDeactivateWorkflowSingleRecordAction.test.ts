import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndContextStoreWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { useDeactivateWorkflowSingleRecordAction } from '../useDeactivateWorkflowSingleRecordAction';
const workflowMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'workflow',
)!;

const activeWorkflowMock = {
  __typename: 'Workflow',
  id: 'workflowId',
  lastPublishedVersionId: 'lastPublishedVersionId',
  currentVersion: {
    __typename: 'WorkflowVersion',
    id: 'currentVersionId',
    trigger: 'trigger',
    status: 'ACTIVE',
    steps: [
      {
        __typename: 'WorkflowStep',
        id: 'stepId1',
      },
    ],
  },
};

const deactivatedWorkflowMock = {
  __typename: 'Workflow',
  id: 'workflowId',
  lastPublishedVersionId: 'lastPublishedVersionId',
  currentVersion: {
    __typename: 'WorkflowVersion',
    id: 'currentVersionId',
    trigger: 'trigger',
    status: 'DEACTIVATED',
    steps: [
      {
        __typename: 'WorkflowStep',
        id: 'stepId1',
      },
    ],
  },
};

jest.mock('@/workflow/hooks/useWorkflowWithCurrentVersion', () => ({
  useWorkflowWithCurrentVersion: jest.fn(),
}));

const deactivateWorkflowVersionMock = jest.fn();

jest.mock('@/workflow/hooks/useDeactivateWorkflowVersion', () => ({
  useDeactivateWorkflowVersion: () => ({
    deactivateWorkflowVersion: deactivateWorkflowVersionMock,
  }),
}));

const activeWorkflowWrapper = getJestMetadataAndApolloMocksAndActionMenuWrapper(
  {
    apolloMocks: [],
    componentInstanceId: '1',
    contextStoreCurrentObjectMetadataNameSingular:
      workflowMockObjectMetadataItem.nameSingular,
    contextStoreTargetedRecordsRule: {
      mode: 'selection',
      selectedRecordIds: [activeWorkflowMock.id],
    },
    onInitializeRecoilSnapshot: (snapshot) => {
      snapshot.set(
        recordStoreFamilyState(activeWorkflowMock.id),
        activeWorkflowMock,
      );
    },
  },
);

const deactivatedWorkflowWrapper =
  getJestMetadataAndApolloMocksAndActionMenuWrapper({
    apolloMocks: [],
    componentInstanceId: '1',
    contextStoreCurrentObjectMetadataNameSingular:
      workflowMockObjectMetadataItem.nameSingular,
    contextStoreTargetedRecordsRule: {
      mode: 'selection',
      selectedRecordIds: [deactivatedWorkflowMock.id],
    },
    onInitializeRecoilSnapshot: (snapshot) => {
      snapshot.set(
        recordStoreFamilyState(deactivatedWorkflowMock.id),
        deactivatedWorkflowMock,
      );
    },
  });

describe('useDeactivateWorkflowSingleRecordAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not be registered when the workflow is deactivated', () => {
    (useWorkflowWithCurrentVersion as jest.Mock).mockImplementation(
      () => deactivatedWorkflowMock,
    );
    const { result } = renderHook(
      () => useDeactivateWorkflowSingleRecordAction(),
      {
        wrapper: deactivatedWorkflowWrapper,
      },
    );

    expect(result.current.shouldBeRegistered).toBe(false);
  });

  it('should be registered when the workflow is active', () => {
    (useWorkflowWithCurrentVersion as jest.Mock).mockImplementation(
      () => activeWorkflowMock,
    );
    const { result } = renderHook(
      () => useDeactivateWorkflowSingleRecordAction(),
      {
        wrapper: activeWorkflowWrapper,
      },
    );

    expect(result.current.shouldBeRegistered).toBe(true);
  });

  it('should call deactivateWorkflowVersion on click', () => {
    (useWorkflowWithCurrentVersion as jest.Mock).mockImplementation(
      () => activeWorkflowMock,
    );
    const { result } = renderHook(
      () => useDeactivateWorkflowSingleRecordAction(),
      {
        wrapper: activeWorkflowWrapper,
      },
    );

    act(() => {
      result.current.onClick();
    });

    expect(deactivateWorkflowVersionMock).toHaveBeenCalledWith(
      activeWorkflowMock.currentVersion.id,
    );
  });
});
