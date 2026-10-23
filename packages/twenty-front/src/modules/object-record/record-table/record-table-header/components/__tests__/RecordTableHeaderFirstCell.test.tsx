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
import { MetadataWritability } from '~/generated-metadata/graphql';

const mockCreateNewIndexRecord = jest.fn();
const mockUseAtomComponentStateValue = jest.fn();
const mockObjectPermissions = jest.fn();
const mockObjectMetadataItem = jest.fn();
const mockHasSoftDeleteFilter = jest.fn();

jest.mock('@/object-record/record-table/contexts/RecordTableContext', () => ({
  useRecordTableContextOrThrow: () => ({
    objectMetadataItem: mockObjectMetadataItem(),
    objectPermissions: mockObjectPermissions(),
    visibleRecordFields: [{ fieldMetadataItemId: 'name', position: 0 }],
  }),
}));
jest.mock('@/object-record/record-table/hooks/useCreateNewIndexRecord', () => ({
  useCreateNewIndexRecord: () => ({
    createNewIndexRecord: mockCreateNewIndexRecord,
  }),
}));
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

const creatableObjectMetadataItem = {
  id: 'company',
  nameSingular: 'company',
  isUICreatable: true,
  isUIEditable: true,
  isRemote: false,
  writability: MetadataWritability.OPEN,
};

describe('RecordTableHeaderFirstCell creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObjectPermissions.mockReturnValue({ canUpdateObjectRecords: true });
    mockObjectMetadataItem.mockReturnValue(creatableObjectMetadataItem);
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

  it('allows keyboard creation without hovering the header', async () => {
    render(<RecordTableHeaderFirstCell />);

    await userEvent.tab();

    expect(screen.getByRole('button', { name: 'Create record' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    expect(mockCreateNewIndexRecord).toHaveBeenCalledWith({
      position: 'first',
    });
  });

  it('keeps keyboard focus when the pointer leaves the header', async () => {
    render(<RecordTableHeaderFirstCell />);
    const header = screen.getByText('Name');

    await userEvent.hover(header);
    await userEvent.tab();
    await userEvent.unhover(header);

    expect(screen.getByRole('button', { name: 'Create record' })).toHaveFocus();
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
    mockObjectPermissions.mockReturnValue({ canUpdateObjectRecords: false });
    render(<RecordTableHeaderFirstCell />);

    await userEvent.hover(screen.getByText('Name'));

    expect(
      screen.queryByRole('button', { name: 'Create record' }),
    ).not.toBeInTheDocument();
  });

  it.each([
    { isUICreatable: false },
    { isUIEditable: false },
    { isRemote: true },
    { writability: MetadataWritability.APPLICATION },
    { writability: MetadataWritability.SYSTEM },
  ])(
    'does not create records for restricted object metadata: %j',
    (overrides) => {
      mockObjectMetadataItem.mockReturnValue({
        ...creatableObjectMetadataItem,
        ...overrides,
      });

      render(<RecordTableHeaderFirstCell />);

      expect(
        screen.queryByRole('button', { name: 'Create record' }),
      ).not.toBeInTheDocument();
    },
  );

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
