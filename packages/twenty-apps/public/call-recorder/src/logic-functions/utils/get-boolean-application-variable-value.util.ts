import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { parseBooleanApplicationVariableValue } from 'src/logic-functions/utils/parse-boolean-application-variable-value.util';

export const getBooleanApplicationVariableValue = ({
  applicationVariableName,
  defaultValue,
}: {
  applicationVariableName: string;
  defaultValue: boolean;
}): boolean =>
  parseBooleanApplicationVariableValue({
    rawValue: getApplicationVariableValue(applicationVariableName),
    defaultValue,
  });
