import { getRecordFilterIdWithDropdownIdScope } from '@/views/editable-chip/utils/getRecordFilterIdWithDropdownIdScope';

type GetEditableChipDropdownIdProps = {
  recordFilterId: string;
  dropdownIdScope?: string;
};

export const getEditableChipDropdownId = ({
  recordFilterId,
  dropdownIdScope,
}: GetEditableChipDropdownIdProps) => {
  const scopedRecordFilterId = getRecordFilterIdWithDropdownIdScope({
    recordFilterId,
    dropdownIdScope,
  });

  return `editable-chip-dropdown-${scopedRecordFilterId}`;
};
