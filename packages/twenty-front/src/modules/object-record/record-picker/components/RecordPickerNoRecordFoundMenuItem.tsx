import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';

import { useLingui } from '@lingui/react/macro';

export const RecordPickerNoRecordFoundMenuItem = () => {
  const { t } = useLingui();
  return <DropdownListItem disabled>{t`No records found`}</DropdownListItem>;
};
