import { ConfigVariableWithTypes } from '@/settings/admin-panel/config-variables/types/ConfigVariableWithTypes';
import { getDisplayValue } from '@/settings/admin-panel/config-variables/utils/getDisplayValue';
import { isDefined } from 'twenty-shared/utils';
export const getSensitiveDisplayValue = (
  variable: ConfigVariableWithTypes,
  showSensitiveValue: boolean,
): string => {
  if (
    variable.isSensitive &&
    !showSensitiveValue &&
    isDefined(variable.value) &&
    variable.value !== ''
  ) {
    return '••••••••••';
  }
  return getDisplayValue(variable.value);
};
