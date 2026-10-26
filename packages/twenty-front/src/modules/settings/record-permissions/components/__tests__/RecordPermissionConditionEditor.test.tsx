import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { useState } from 'react';
import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
  type RecordPermissionCondition,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordPermissionConditionEditor } from '@/settings/record-permissions/components/RecordPermissionConditionEditor';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

jest.mock('@/object-metadata/hooks/useFilteredObjectMetadataItems', () => ({
  useFilteredObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));
jest.mock(
  '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow',
  () => ({
    useSetRecordFilterUsedInAdvancedFilterDropdownRow: () => ({
      setRecordFilterUsedInAdvancedFilterDropdownRow: jest.fn(),
    }),
  }),
);
jest.mock(
  '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRecordLevelPermissionFilterActions',
  () => ({
    useRecordLevelPermissionFilterActions: () => ({
      handleCreateFirstFilter: jest.fn(),
      handleAddFilter: jest.fn(),
    }),
  }),
);
jest.mock(
  '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow',
  () => ({
    SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow: ({
      recordFilter,
    }: {
      recordFilter: RecordFilter;
    }) => {
      const setCurrentRecordFilters = useSetAtomComponentState(
        currentRecordFiltersComponentState,
      );
      return (
        <input
          aria-label="City condition"
          value={recordFilter.value}
          onChange={(event) =>
            setCurrentRecordFilters((previous) =>
              previous.map((filter) =>
                filter.id === recordFilter.id
                  ? { ...filter, value: event.target.value }
                  : filter,
              ),
            )
          }
        />
      );
    },
  }),
);

const field = {
  id: v4(),
  universalIdentifier: v4(),
  name: 'city',
  label: 'City',
  type: FieldMetadataType.TEXT,
};
const object = {
  id: v4(),
  universalIdentifier: v4(),
  nameSingular: 'company',
  fields: [field],
} as EnrichedObjectMetadataItem;
const original: RecordPermissionCondition = {
  kind: 'predicate',
  fieldUniversalIdentifier: field.universalIdentifier,
  operand: RowLevelPermissionPredicateOperand.CONTAINS,
  value: 'Paris',
};
const onChange = jest.fn();
const ruleId = v4();
const Editor = () => {
  const [condition, setCondition] =
    useState<RecordPermissionCondition>(original);
  return (
    <Provider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <RecordPermissionConditionEditor
          ruleId={ruleId}
          objectMetadataItem={object}
          condition={condition}
          onChange={(next) => {
            onChange(next);
            setCondition(next);
          }}
        />
        <button onClick={() => setCondition(original)}>Reset draft</button>
      </I18nProvider>
    </Provider>
  );
};

describe('Permission condition editor', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
  });

  it('keeps an untouched rule clean and propagates edits without resetting typed input', async () => {
    const user = userEvent.setup();
    render(<Editor />);
    await screen.findByDisplayValue('Paris');
    expect(onChange).not.toHaveBeenCalled();
    const input = screen.getByRole('textbox', { name: 'City condition' });
    await user.clear(input);
    await user.type(input, 'London');
    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          kind: 'all',
          conditions: [expect.objectContaining({ value: 'London' })],
        }),
      ),
    );
    expect(input).toHaveValue('London');
    onChange.mockClear();
    await user.click(screen.getByRole('button', { name: 'Reset draft' }));
    await screen.findByDisplayValue('Paris');
    expect(onChange).not.toHaveBeenCalled();
  });
});
