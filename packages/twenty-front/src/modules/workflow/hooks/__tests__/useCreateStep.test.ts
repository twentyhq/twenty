import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { renderHook } from '@testing-library/react';
import { useCreateStep } from '../useCreateStep';

const mockOpenRightDrawer = jest.fn();
const mockUpdateOneWorkflowVersion = jest.fn();
const mockCreateNewWorkflowVersion = jest.fn();
const mockComputeStepOutputSchema = jest.fn().mockResolvedValue({
  data: { computeStepOutputSchema: { type: 'object' } },
});

jest.mock('recoil', () => ({
  useRecoilValue: () => 'parent-step-id',
  useSetRecoilState: () => jest.fn(),
  atom: (params: any) => params,
}));

jest.mock('@/workflow/states/workflowCreateStepFromParentStepIdState', () => ({
  workflowCreateStepFromParentStepIdState: 'mockAtomState',
}));

jest.mock('@/ui/layout/right-drawer/hooks/useRightDrawer', () => ({
  useRightDrawer: () => ({
    openRightDrawer: mockOpenRightDrawer,
  }),
}));

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({
    updateOneRecord: mockUpdateOneWorkflowVersion,
  }),
}));

jest.mock('@/workflow/hooks/useCreateNewWorkflowVersion', () => ({
  useCreateNewWorkflowVersion: () => ({
    createNewWorkflowVersion: mockCreateNewWorkflowVersion,
  }),
}));

jest.mock('@/workflow/hooks/useComputeStepOutputSchema', () => ({
  useComputeStepOutputSchema: () => ({
    computeStepOutputSchema: mockComputeStepOutputSchema,
  }),
}));

jest.mock('@/object-metadata/hooks/useFilteredObjectMetadataItems', () => ({
  useFilteredObjectMetadataItems: () => ({
    activeObjectMetadataItems: [],
  }),
}));

jest.mock('@/workflow/utils/insertStep', () => ({
  insertStep: jest
    .fn()
    .mockImplementation(({ steps, stepToAdd }) => [...steps, stepToAdd]),
}));

describe('useCreateStep', () => {
  const mockWorkflow = {
    id: '123',
    currentVersion: {
      id: '456',
      status: 'DRAFT',
      steps: [],
      trigger: { type: 'manual' },
    },
    versions: [],
  };

  it('should create step in draft version', async () => {
    const { result } = renderHook(() =>
      useCreateStep({
        workflow: mockWorkflow as unknown as WorkflowWithCurrentVersion,
      }),
    );
    await result.current.createStep('CODE');

    expect(mockUpdateOneWorkflowVersion).toHaveBeenCalled();
    expect(mockOpenRightDrawer).toHaveBeenCalled();
  });
});
