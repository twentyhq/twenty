import { ListItem } from 'twenty-ui/primitives/navigation';

import { useLingui } from '@lingui/react/macro';

export const RecordPickerNoRecordFoundMenuItem = () => {
  const { t } = useLingui();
  return <ListItem disabled>{t`No records found`}</ListItem>;
};
