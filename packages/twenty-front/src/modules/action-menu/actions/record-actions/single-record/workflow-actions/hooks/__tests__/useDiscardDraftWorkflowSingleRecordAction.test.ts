import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { useDiscardDraftWorkflowSingleRecordAction } from '../useDiscardDraftWorkflowSingleRecordAction';

const workflowMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'workflow',
)!;

const mockedWorkflowEnabledFeatureFlag = {
  id: '1',
  key: FeatureFlagKey.IsWorkflowEnabled,
  value: true,
  workspaceId: '1',
};

const draftWorkflowMock = {
  __typename: 'Workflow',
  id: 'workflowId',
  lastPublishedVersionId: 'lastPublishedVersionId',
  currentVersion: {
    __typename: 'WorkflowVersion',
    id: 'currentVersionId',
    trigger: 'trigger',
    status: 'DRAFT',
    steps: [
      {
        __typename: 'WorkflowStep',
        id: 'stepId1',
      },
    ],
  },
  versions: [
    {
      __typename: 'WorkflowVersion',
      id: 'currentVersionId',
      trigger: 'trigger',
      status: 'DRAFT',
      steps: [
        {
          __typename: 'WorkflowStep',
          id: 'stepId1',
        },
      ],
    },
    {
      __typename: 'WorkflowVersion',
      id: 'versionId2',
      trigger: 'trigger',
      status: 'ACTIVE',
      steps: [
        {
          __typename: 'WorkflowStep',
          id: 'stepId2',
        },
      ],
    },
  ],
};

jest.mock('@/workflow/hooks/useWorkflowWithCurrentVersion', () => ({
  useWorkflowWithCurrentVersion: jest.fn(),
}));

const deleteOneWorkflowVersionMock = jest.fn();

jest.mock('@/workflow/hooks/useDeleteOneWorkflowVersion', () => ({
  useDeleteOneWorkflowVersion: () => ({
    deleteOneWorkflowVersion: deleteOneWorkflowVersionMock,
  }),
}));

const draftWorkflowWrapper = getJestMetadataAndApolloMocksAndActionMenuWrapper({
  apolloMocks: [],
  componentInstanceId: '1',
  contextStoreCurrentObjectMetadataNameSingular:
    workflowMockObjectMetadataItem.nameSingular,
  contextStoreTargetedRecordsRule: {
    mode: 'selection',
    selectedRecordIds: [draftWorkflowMock.id],
  },
  onInitializeRecoilSnapshot: (snapshot) => {
    snapshot.set(
      recordStoreFamilyState(draftWorkflowMock.id),
      draftWorkflowMock,
    );
    snapshot.set(currentWorkspaceState, {
      ...mockCurrentWorkspace,
      featureFlags: [mockedWorkflowEnabledFeatureFlag],
    });
  },
});

describe('useDiscardDraftWorkflowSingleRecordAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call deleteOneWorkflowVersion on click', () => {
    (useWorkflowWithCurrentVersion as jest.Mock).mockImplementation(
      () => draftWorkflowMock,
    );
    const { result } = renderHook(
      () => useDiscardDraftWorkflowSingleRecordAction(),
      {
        wrapper: draftWorkflowWrapper,
      },
    );

    act(() => {
      result.current.onClick();
    });

    expect(deleteOneWorkflowVersionMock).toHaveBeenCalledWith({
      workflowVersionId: draftWorkflowMock.currentVersion.id,
    });
  });
});
