import { isNonEmptyString } from '@sniptt/guards';

type GetRecordFilterIdWithDropdownIdScopeProps = {
  recordFilterId: string;
  dropdownIdScope?: string;
};

export const getRecordFilterIdWithDropdownIdScope = ({
  recordFilterId,
  dropdownIdScope,
}: GetRecordFilterIdWithDropdownIdScopeProps) => {
  return isNonEmptyString(dropdownIdScope)
    ? `${dropdownIdScope}-${recordFilterId}`
    : recordFilterId;
};
