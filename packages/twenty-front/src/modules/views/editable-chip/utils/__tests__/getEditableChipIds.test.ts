import { getEditableChipDropdownId } from '@/views/editable-chip/utils/getEditableChipDropdownId';
import { getEditableChipObjectFilterDropdownComponentInstanceId } from '@/views/editable-chip/utils/getEditableChipObjectFilterDropdownComponentInstanceId';

describe('editable filter chip IDs', () => {
  it('keeps the existing IDs when no scope is provided', () => {
    expect(getEditableChipDropdownId({ recordFilterId: 'filter-id' })).toBe(
      'editable-chip-dropdown-filter-id',
    );
    expect(
      getEditableChipObjectFilterDropdownComponentInstanceId({
        recordFilterId: 'filter-id',
      }),
    ).toBe('editable-filter-filter-id');
  });

  it('uses the same scope for the dropdown and its component state', () => {
    expect(
      getEditableChipDropdownId({
        recordFilterId: 'filter-id',
        dropdownIdScope: 'widget-id',
      }),
    ).toBe('editable-chip-dropdown-widget-id-filter-id');
    expect(
      getEditableChipObjectFilterDropdownComponentInstanceId({
        recordFilterId: 'filter-id',
        dropdownIdScope: 'widget-id',
      }),
    ).toBe('editable-filter-widget-id-filter-id');
  });
});
