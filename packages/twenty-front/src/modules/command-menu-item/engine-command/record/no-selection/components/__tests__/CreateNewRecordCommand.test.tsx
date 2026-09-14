import { CreateNewRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/CreateNewRecordCommand';
import { render } from '@testing-library/react';

const mockUseHeadlessCommandContextApi = jest.fn();
const mockUseCreateNewIndexRecord = jest.fn();
const mockUseCreateNewRecord = jest.fn();
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
  '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect',
  () => ({ HeadlessEngineCommandWrapperEffect: () => null }),
);

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCreateNewRecord.mockReturnValue({ createNewRecord: jest.fn() });
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
      creationTargetObjectMetadataId: targetObject.id,
    });

    render(<CreateNewRecordCommand />);

    expect(mockUseCreateNewRecord).toHaveBeenCalledWith({
      objectMetadataItem: targetObject,
    });
    expect(mockUseCreateNewIndexRecord).not.toHaveBeenCalled();
  },
);

it('preserves the current view for the existing index command', () => {
  mockUseHeadlessCommandContextApi.mockReturnValue({
    objectMetadataItem: mockCompany,
    recordIndexId: 'company-view',
    creationTargetObjectMetadataId: null,
  });

  render(<CreateNewRecordCommand />);

  expect(mockUseCreateNewIndexRecord).toHaveBeenCalledWith({
    objectMetadataItem: mockCompany,
    instanceId: 'company-view',
  });
});
