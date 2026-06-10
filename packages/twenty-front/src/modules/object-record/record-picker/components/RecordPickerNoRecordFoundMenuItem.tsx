import { MenuItem } from 'twenty-ui-deprecated/navigation';

import { useLingui } from '@lingui/react/macro';

export const RecordPickerNoRecordFoundMenuItem = () => {
  const { t } = useLingui();
  return <MenuItem disabled text={t`No records found`} accent="placeholder" />;
};
