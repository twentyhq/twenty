import { isNonEmptyString } from '@sniptt/guards';

import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';

export const shouldDisplayApplicationVariable = (
  variable: CallRecorderApplicationVariable,
): boolean => !variable.isDeprecated || isNonEmptyString(variable.value);
