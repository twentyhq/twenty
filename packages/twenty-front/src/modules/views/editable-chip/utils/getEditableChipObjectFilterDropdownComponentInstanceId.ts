import { getRecordFilterIdWithDropdownIdScope } from '@/views/editable-chip/utils/getRecordFilterIdWithDropdownIdScope';

type GetEditableChipObjectFilterDropdownComponentInstanceIdProps = {
  recordFilterId: string;
  dropdownIdScope?: string;
};

export const getEditableChipObjectFilterDropdownComponentInstanceId = ({
  recordFilterId,
  dropdownIdScope,
}: GetEditableChipObjectFilterDropdownComponentInstanceIdProps) => {
  const scopedRecordFilterId = getRecordFilterIdWithDropdownIdScope({
    recordFilterId,
    dropdownIdScope,
  });

  return `editable-filter-${scopedRecordFilterId}`;
};
