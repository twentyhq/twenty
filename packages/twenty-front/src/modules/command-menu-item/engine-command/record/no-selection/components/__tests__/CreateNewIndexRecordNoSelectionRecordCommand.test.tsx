import { CreateNewIndexRecordNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/CreateNewIndexRecordNoSelectionRecordCommand';
import { render } from '@testing-library/react';

const mockUseHeadlessCommandContextApi = jest.fn();
const mockUseCreateNewIndexRecord = jest.fn();
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
jest.mock('@/object-core/workflows/hooks/useCreateCoreWorkflow', () => ({
  useCreateCoreWorkflow: () => ({ createCoreWorkflow: jest.fn() }),
}));
jest.mock(
  '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect',
  () => ({ HeadlessEngineCommandWrapperEffect: () => null }),
);

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCreateNewIndexRecord.mockReturnValue({
    createNewIndexRecord: jest.fn(),
  });
});

it.each([
  [mockTask, mockCompany],
  [mockCompany, mockTask],
  [null, mockCompany],
])(
  'creates the target object independently of the current page (%j to %j)',
  (currentObject, targetObject) => {
    mockUseHeadlessCommandContextApi.mockReturnValue({
      objectMetadataItem: currentObject,
      recordIndexId: 'current-view',
      navigationTargetObjectMetadataId: targetObject.id,
    });

    render(<CreateNewIndexRecordNoSelectionRecordCommand />);

    expect(mockUseCreateNewIndexRecord).toHaveBeenCalledWith({
      objectMetadataItem: targetObject,
      instanceId: `global-record-creation-${targetObject.id}`,
    });
  },
);

it('preserves the current view for the existing index command', () => {
  mockUseHeadlessCommandContextApi.mockReturnValue({
    objectMetadataItem: mockCompany,
    recordIndexId: 'company-view',
    navigationTargetObjectMetadataId: null,
  });

  render(<CreateNewIndexRecordNoSelectionRecordCommand />);

  expect(mockUseCreateNewIndexRecord).toHaveBeenCalledWith({
    objectMetadataItem: mockCompany,
    instanceId: 'company-view',
  });
});
