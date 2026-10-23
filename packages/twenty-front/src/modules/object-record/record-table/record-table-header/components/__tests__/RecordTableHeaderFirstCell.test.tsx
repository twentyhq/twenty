import { RecordTableHeaderFirstCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderFirstCell';
import {
  RecordTableWidgetContext,
  type RecordTableWidgetContextValue,
} from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { isRecordTableColumnHeadersReadOnlyComponentState } from '@/object-record/record-table/states/isRecordTableColumnHeadersReadOnlyComponentState';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';

const mockCreateNewIndexRecord = jest.fn();
const mockUseAtomComponentStateValue = jest.fn();
const mockCanCreateRecords = jest.fn();
const mockHasSoftDeleteFilter = jest.fn();

jest.mock('@/object-record/record-table/contexts/RecordTableContext', () => ({
  useRecordTableContextOrThrow: () => ({
    objectMetadataItem: { id: 'company', nameSingular: 'company' },
    objectPermissions: { canUpdateObjectRecords: true },
    visibleRecordFields: [{ fieldMetadataItemId: 'name', position: 0 }],
  }),
}));
jest.mock('@/object-record/record-table/hooks/useCreateNewIndexRecord', () => ({
  useCreateNewIndexRecord: () => ({
    createNewIndexRecord: mockCreateNewIndexRecord,
  }),
}));
jest.mock(
  '@/object-record/utils/canCreateRecordsForObjectMetadataItem',
  () => ({
    canCreateRecordsForObjectMetadataItem: () => mockCanCreateRecords(),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: (state: unknown) =>
      mockUseAtomComponentStateValue(state),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue',
  () => ({
    useAtomComponentFamilyStateValue: () => false,
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue',
  () => ({
    useAtomComponentSelectorValue: () => mockHasSoftDeleteFilter(),
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => false,
}));
jest.mock('twenty-ui/utilities', () => ({ useIsMobile: () => false }));
jest.mock(
  '@/object-record/record-table/record-table-header/components/RecordTableColumnHead',
  () => ({
    RecordTableColumnHead: () => <span>Name</span>,
  }),
);
jest.mock(
  '@/object-record/record-table/record-table-header/components/RecordTableColumnHeadWithDropdown',
  () => ({
    RecordTableColumnHeadWithDropdown: () => <button>Column options</button>,
  }),
);
jest.mock(
  '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler',
  () => ({
    RecordTableHeaderResizeHandler: () => null,
  }),
);

describe('RecordTableHeaderFirstCell creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanCreateRecords.mockReturnValue(true);
    mockHasSoftDeleteFilter.mockReturnValue(false);
    mockUseAtomComponentStateValue.mockImplementation(
      (state: ComponentState<unknown>) =>
        state === isRecordTableColumnHeadersReadOnlyComponentState,
    );
  });

  it('creates a record while widget column settings stay read-only', async () => {
    render(<RecordTableHeaderFirstCell />);

    await userEvent.hover(screen.getByText('Name'));
    await userEvent.click(
      screen.getByRole('button', { name: 'Create record' }),
    );

    expect(mockCreateNewIndexRecord).toHaveBeenCalledWith({
      position: 'first',
    });
    expect(
      screen.queryByRole('button', { name: 'Column options' }),
    ).not.toBeInTheDocument();
  });

  it('does not offer creation when the widget records are read-only', async () => {
    mockUseAtomComponentStateValue.mockImplementation(
      (state: ComponentState<unknown>) =>
        state === isRecordTableColumnHeadersReadOnlyComponentState ||
        state === isRecordTableCellsNonEditableComponentState,
    );
    render(<RecordTableHeaderFirstCell />);

    await userEvent.hover(screen.getByText('Name'));

    expect(
      screen.queryByRole('button', { name: 'Create record' }),
    ).not.toBeInTheDocument();
  });

  it('keeps object creation permissions enforced', async () => {
    mockCanCreateRecords.mockReturnValue(false);
    render(<RecordTableHeaderFirstCell />);

    await userEvent.hover(screen.getByText('Name'));

    expect(
      screen.queryByRole('button', { name: 'Create record' }),
    ).not.toBeInTheDocument();
  });

  it('does not offer creation in the deleted-records view', async () => {
    mockHasSoftDeleteFilter.mockReturnValue(true);
    render(<RecordTableHeaderFirstCell />);

    await userEvent.hover(screen.getByText('Name'));

    expect(
      screen.queryByRole('button', { name: 'Create record' }),
    ).not.toBeInTheDocument();
  });

  it.each<Partial<RecordTableWidgetContextValue>>([
    {
      nestedRelationCreateThrough: {
        relationObjectMetadataNameSingular: 'person',
        relationRecordsFilter: {},
        nestedRelationJoinColumnName: 'personId',
      },
    },
    {
      junctionCreateThrough: {
        junctionObjectMetadataId: 'junction',
        junctionObjectMetadataNameSingular: 'companyPerson',
        sourceJoinColumnName: 'companyId',
        sourceRecordId: 'company-id',
        targetJoinColumnName: 'personId',
        targetObjectMetadataNameSingular: 'person',
        targetRecordsFilter: {},
      },
    },
  ])(
    'does not bypass the relation picker for a create-through widget',
    async (createThrough) => {
      render(
        <RecordTableWidgetContext.Provider
          value={{
            widgetId: 'widget',
            isPageLayoutInEditMode: false,
            updateViewDraftField: jest.fn(),
            updateViewDraft: jest.fn(),
            ...createThrough,
          }}
        >
          <RecordTableHeaderFirstCell />
        </RecordTableWidgetContext.Provider>,
      );

      await userEvent.hover(screen.getByText('Name'));

      expect(
        screen.queryByRole('button', { name: 'Create record' }),
      ).not.toBeInTheDocument();
      expect(mockCreateNewIndexRecord).not.toHaveBeenCalled();
    },
  );
});
