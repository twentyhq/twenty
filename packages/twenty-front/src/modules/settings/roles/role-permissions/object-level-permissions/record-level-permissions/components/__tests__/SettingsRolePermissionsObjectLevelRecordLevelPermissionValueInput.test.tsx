import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { ViewFilterOperand } from 'twenty-shared/types';

import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionValueInput } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionValueInput';

const mockUpsertFilter = jest.fn();

jest.mock('@/object-metadata/hooks/useFieldMetadataItemById', () => ({
  useFieldMetadataItemById: () => ({
    fieldMetadataItem: { id: 'field-id', name: 'owner', type: 'RELATION' },
  }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem: { fields: [] } }),
}));

jest.mock(
  '@/object-record/object-filter-dropdown/hooks/useUpsertObjectFilterDropdownCurrentFilter',
  () => ({
    useUpsertObjectFilterDropdownCurrentFilter: () => ({
      upsertObjectFilterDropdownCurrentFilter: mockUpsertFilter,
    }),
  }),
);

jest.mock(
  '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue',
  () => ({
    useApplyObjectFilterDropdownFilterValue: () => ({
      applyObjectFilterDropdownFilterValue: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition',
  () => ({
    formatFieldMetadataItemAsFieldDefinition: () => ({ type: 'RELATION' }),
  }),
);

jest.mock('@/object-record/record-field/ui/components/FormFieldInput', () => ({
  FormFieldInput: () => <div>Static value input</div>,
}));

const INSTANCE_ID = 'record-level-permission-filter';

const renderValueInput = ({
  value,
  operand = ViewFilterOperand.IS,
  type = 'RELATION',
}: {
  value: string;
  operand?: ViewFilterOperand;
  type?: RecordFilter['type'];
}) => {
  const recordFilter: RecordFilter = {
    id: 'filter-id',
    fieldMetadataId: 'field-id',
    value,
    displayValue: value,
    type,
    operand,
    label: 'Owner',
  };

  const store = createStore();
  store.set(
    currentRecordFiltersComponentState.atomFamily({ instanceId: INSTANCE_ID }),
    [recordFilter],
  );

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <RecordFiltersComponentInstanceContext.Provider
          value={{ instanceId: INSTANCE_ID }}
        >
          <SettingsRolePermissionsObjectLevelRecordLevelPermissionValueInput recordFilterId="filter-id" />
        </RecordFiltersComponentInstanceContext.Provider>
      </JotaiProvider>
    </I18nProvider>,
  );

  return { recordFilter };
};

describe('SettingsRolePermissionsObjectLevelRecordLevelPermissionValueInput', () => {
  beforeAll(() => {
    i18n.loadAndActivate({ locale: 'en', messages: {} });
  });

  beforeEach(() => {
    mockUpsertFilter.mockClear();
  });

  it('shows Me for a relation value selecting the current workspace member', () => {
    renderValueInput({
      value: JSON.stringify({
        isCurrentWorkspaceMemberSelected: true,
        selectedRecordIds: [],
      }),
    });

    expect(screen.getByText('Me')).toBeInTheDocument();
    expect(screen.queryByText('Static value input')).not.toBeInTheDocument();
  });

  it('shows the other selected records next to Me', () => {
    renderValueInput({
      value: JSON.stringify({
        isCurrentWorkspaceMemberSelected: true,
        selectedRecordIds: ['record-1', 'record-2'],
      }),
    });

    expect(screen.getByText('Me')).toBeInTheDocument();
    expect(screen.getByText('+ 2 more')).toBeInTheDocument();
  });

  it('clears the relation value when resetting to a static value from the keyboard', async () => {
    const { recordFilter } = renderValueInput({
      value: JSON.stringify({
        isCurrentWorkspaceMemberSelected: true,
        selectedRecordIds: [],
      }),
    });

    await userEvent.tab();
    expect(
      screen.getByRole('button', { name: 'Reset to static value' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(mockUpsertFilter).toHaveBeenCalledTimes(1);
    expect(mockUpsertFilter).toHaveBeenCalledWith({
      ...recordFilter,
      value: '',
      rlsDynamicValue: null,
    });
  });

  it.each([ViewFilterOperand.IS_EMPTY, ViewFilterOperand.IS_NOT_EMPTY])(
    'hides a leftover current workspace member value for the %s operand',
    (operand) => {
      renderValueInput({
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: true,
          selectedRecordIds: ['record-1'],
        }),
        operand,
      });

      expect(screen.queryByText('Me')).not.toBeInTheDocument();
      expect(screen.queryByText('+ 1 more')).not.toBeInTheDocument();
      expect(screen.queryByText('Static value input')).not.toBeInTheDocument();
    },
  );

  it('keeps the static input for a relation value without the current workspace member', () => {
    renderValueInput({
      value: JSON.stringify({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: ['record-1'],
      }),
    });

    expect(screen.getByText('Static value input')).toBeInTheDocument();
    expect(screen.queryByText('Me')).not.toBeInTheDocument();
  });

  it('keeps the static input for a text value shaped like a relation value', () => {
    renderValueInput({
      value: JSON.stringify({
        isCurrentWorkspaceMemberSelected: true,
        selectedRecordIds: [],
      }),
      operand: ViewFilterOperand.CONTAINS,
      type: 'TEXT',
    });

    expect(screen.getByText('Static value input')).toBeInTheDocument();
    expect(screen.queryByText('Me')).not.toBeInTheDocument();
  });
});
