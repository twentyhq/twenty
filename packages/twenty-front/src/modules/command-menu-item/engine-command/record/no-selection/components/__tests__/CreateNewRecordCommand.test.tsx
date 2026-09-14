import { CreateNewRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/CreateNewRecordCommand';
import { render, waitFor } from '@testing-library/react';

const mockUseHeadlessCommandContextApi = jest.fn();
const mockUseCreateNewIndexRecord = jest.fn();
const mockUseCreateNewRecord = jest.fn();
const mockCreateNewRecord = jest.fn();
const mockCreateNewIndexRecord = jest.fn();
const mockUnmountCommand = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();
const mockCompany = { id: 'company', nameSingular: 'company' };
const mockTask = { id: 'task', nameSingular: 'task' };

jest.mock(
  '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi',
  () => ({
    useHeadlessCommandContextApi: () => mockUseHeadlessCommandContextApi(),
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => [mockCompany, mockTask],
}));
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => false,
}));
jest.mock('@/object-record/record-table/hooks/useCreateNewIndexRecord', () => ({
  useCreateNewIndexRecord: (props: unknown) =>
    mockUseCreateNewIndexRecord(props),
}));
jest.mock('@/object-record/hooks/useCreateNewRecord', () => ({
  useCreateNewRecord: (props: unknown) => mockUseCreateNewRecord(props),
}));
jest.mock('@/object-core/workflows/hooks/useCreateCoreWorkflow', () => ({
  useCreateCoreWorkflow: () => ({ createCoreWorkflow: jest.fn() }),
}));
jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({ useAvailableComponentInstanceIdOrThrow: () => 'create-command' }),
);
jest.mock(
  '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand',
  () => ({ useUnmountCommand: () => mockUnmountCommand }),
);
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({ enqueueErrorSnackBar: mockEnqueueErrorSnackBar }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateNewRecord.mockResolvedValue({ id: 'created-record' });
  mockCreateNewIndexRecord.mockResolvedValue({ id: 'created-index-record' });
  mockUseCreateNewRecord.mockReturnValue({
    createNewRecord: mockCreateNewRecord,
  });
  mockUseCreateNewIndexRecord.mockReturnValue({
    createNewIndexRecord: mockCreateNewIndexRecord,
  });
});

it.each([
  [mockTask, mockCompany],
  [mockCompany, mockTask],
  [null, mockCompany],
])(
  'creates the target object independently of the current page (%j to %j)',
  async (currentObject, targetObject) => {
    mockUseHeadlessCommandContextApi.mockReturnValue({
      objectMetadataItem: currentObject,
      recordIndexId: 'current-view',
      creationTargetObjectMetadataId: targetObject.id,
    });

    render(<CreateNewRecordCommand />);

    expect(mockUseCreateNewRecord).toHaveBeenCalledTimes(1);
    expect(mockUseCreateNewRecord).toHaveBeenCalledWith({
      objectMetadataItem: targetObject,
    });
    expect(mockUseCreateNewIndexRecord).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(mockUnmountCommand).toHaveBeenCalledWith('create-command'),
    );
    expect(mockCreateNewRecord).toHaveBeenCalledTimes(1);
    expect(mockCreateNewRecord).toHaveBeenCalledWith({ position: 'first' });
    expect(mockCreateNewIndexRecord).not.toHaveBeenCalled();
    expect(mockEnqueueErrorSnackBar).not.toHaveBeenCalled();
  },
);

it('preserves the current view for the existing index command', async () => {
  mockUseHeadlessCommandContextApi.mockReturnValue({
    objectMetadataItem: mockCompany,
    recordIndexId: 'company-view',
    creationTargetObjectMetadataId: null,
  });

  render(<CreateNewRecordCommand />);

  expect(mockUseCreateNewIndexRecord).toHaveBeenCalledTimes(1);
  expect(mockUseCreateNewIndexRecord).toHaveBeenCalledWith({
    objectMetadataItem: mockCompany,
    instanceId: 'company-view',
  });
  await waitFor(() =>
    expect(mockUnmountCommand).toHaveBeenCalledWith('create-command'),
  );
  expect(mockCreateNewIndexRecord).toHaveBeenCalledTimes(1);
  expect(mockCreateNewIndexRecord).toHaveBeenCalledWith({ position: 'first' });
  expect(mockCreateNewRecord).not.toHaveBeenCalled();
  expect(mockEnqueueErrorSnackBar).not.toHaveBeenCalled();
});
