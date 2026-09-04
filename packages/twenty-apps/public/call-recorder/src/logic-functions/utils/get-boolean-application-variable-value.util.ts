import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const TRUTHY_VALUES = new Set(['true', '1', 'yes', 'on']);
const FALSY_VALUES = new Set(['false', '0', 'no', 'off']);

export const getBooleanApplicationVariableValue = ({
  applicationVariableName,
  defaultValue,
}: {
  applicationVariableName: string;
  defaultValue: boolean;
}): boolean => {
  const rawValue = getApplicationVariableValue(applicationVariableName);

  if (!isNonEmptyString(rawValue)) {
    return defaultValue;
  }

  const normalizedValue = rawValue.trim().toLowerCase();

  if (TRUTHY_VALUES.has(normalizedValue)) {
    return true;
  }

  if (FALSY_VALUES.has(normalizedValue)) {
    return false;
  }

  return defaultValue;
};
