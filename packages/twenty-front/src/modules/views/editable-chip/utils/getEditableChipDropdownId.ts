type GetEditableChipDropdownIdProps = {
  recordFilterId: string;
};

export const getEditableChipDropdownId = ({
  recordFilterId,
}: GetEditableChipDropdownIdProps) => {
  return `editable-chip-dropdown-${recordFilterId}`;
};
