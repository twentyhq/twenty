type GetEditableChipObjectFilterDropdownComponentInstanceIdProps = {
  recordFilterId: string;
};

export const getEditableChipObjectFilterDropdownComponentInstanceId = ({
  recordFilterId,
}: GetEditableChipObjectFilterDropdownComponentInstanceIdProps) => {
  return `editable-filter-${recordFilterId}`;
};
