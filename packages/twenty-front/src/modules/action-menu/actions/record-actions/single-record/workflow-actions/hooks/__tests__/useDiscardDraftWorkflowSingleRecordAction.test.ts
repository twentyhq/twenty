import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndContextStoreWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { useDiscardDraftWorkflowSingleRecordAction } from '../useDiscardDraftWorkflowSingleRecordAction';

const workflowMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'workflow',
)!;

const noDraftWorkflowMock = {
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
  versions: [
    {
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

const draftWorkflowMockWithOneVersion = {
  ...draftWorkflowMock,
  versions: [draftWorkflowMock.currentVersion],
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

const noDraftWorkflowWrapper =
  getJestMetadataAndApolloMocksAndActionMenuWrapper({
    apolloMocks: [],
    componentInstanceId: '1',
    contextStoreCurrentObjectMetadataNameSingular:
      workflowMockObjectMetadataItem.nameSingular,
    contextStoreTargetedRecordsRule: {
      mode: 'selection',
      selectedRecordIds: [noDraftWorkflowMock.id],
    },
    onInitializeRecoilSnapshot: (snapshot) => {
      snapshot.set(
        recordStoreFamilyState(noDraftWorkflowMock.id),
        noDraftWorkflowMock,
      );
    },
  });

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
  },
});

const draftWorkflowWithOneVersionWrapper =
  getJestMetadataAndApolloMocksAndActionMenuWrapper({
    apolloMocks: [],
    componentInstanceId: '1',
    contextStoreCurrentObjectMetadataNameSingular:
      workflowMockObjectMetadataItem.nameSingular,
    contextStoreTargetedRecordsRule: {
      mode: 'selection',
      selectedRecordIds: [draftWorkflowMockWithOneVersion.id],
    },
    onInitializeRecoilSnapshot: (snapshot) => {
      snapshot.set(
        recordStoreFamilyState(draftWorkflowMockWithOneVersion.id),
        draftWorkflowMockWithOneVersion,
      );
    },
  });

describe('useDiscardDraftWorkflowSingleRecordAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not be registered when there is no draft', () => {
    (useWorkflowWithCurrentVersion as jest.Mock).mockImplementation(
      () => noDraftWorkflowMock,
    );
    const { result } = renderHook(
      () => useDiscardDraftWorkflowSingleRecordAction(),
      {
        wrapper: noDraftWorkflowWrapper,
      },
    );

    expect(result.current.shouldBeRegistered).toBe(false);
  });

  it('should not be registered when there is only one version', () => {
    (useWorkflowWithCurrentVersion as jest.Mock).mockImplementation(
      () => draftWorkflowMockWithOneVersion,
    );

    const { result } = renderHook(
      () => useDiscardDraftWorkflowSingleRecordAction(),
      {
        wrapper: draftWorkflowWithOneVersionWrapper,
      },
    );

    expect(result.current.shouldBeRegistered).toBe(false);
  });

  it('should be registered when the workflow is draft', () => {
    (useWorkflowWithCurrentVersion as jest.Mock).mockImplementation(
      () => draftWorkflowMock,
    );
    const { result } = renderHook(
      () => useDiscardDraftWorkflowSingleRecordAction(),
      {
        wrapper: draftWorkflowWrapper,
      },
    );

    expect(result.current.shouldBeRegistered).toBe(true);
  });

  it('should call deactivateWorkflowVersion on click', () => {
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
