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

const renderValueInput = (value: string) => {
  const recordFilter: RecordFilter = {
    id: 'filter-id',
    fieldMetadataId: 'field-id',
    value,
    displayValue: value,
    type: 'RELATION',
    operand: ViewFilterOperand.IS,
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
    renderValueInput(
      JSON.stringify({
        isCurrentWorkspaceMemberSelected: true,
        selectedRecordIds: [],
      }),
    );

    expect(screen.getByText('Me')).toBeInTheDocument();
    expect(screen.queryByText('Static value input')).not.toBeInTheDocument();
  });

  it('shows the other selected records next to Me', () => {
    renderValueInput(
      JSON.stringify({
        isCurrentWorkspaceMemberSelected: true,
        selectedRecordIds: ['record-1', 'record-2'],
      }),
    );

    expect(screen.getByText('Me')).toBeInTheDocument();
    expect(screen.getByText('+ 2 more')).toBeInTheDocument();
  });

  it('clears the relation value when resetting to a static value', async () => {
    const { recordFilter } = renderValueInput(
      JSON.stringify({
        isCurrentWorkspaceMemberSelected: true,
        selectedRecordIds: [],
      }),
    );

    await userEvent.click(screen.getByLabelText('Reset to static value'));

    expect(mockUpsertFilter).toHaveBeenCalledWith({
      ...recordFilter,
      value: '',
      rlsDynamicValue: null,
    });
  });

  it('keeps the static input for a relation value without the current workspace member', () => {
    renderValueInput(
      JSON.stringify({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: ['record-1'],
      }),
    );

    expect(screen.getByText('Static value input')).toBeInTheDocument();
    expect(screen.queryByText('Me')).not.toBeInTheDocument();
  });
});
