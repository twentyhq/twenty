import { isNonEmptyString } from '@sniptt/guards';

import { type FirefliesApplicationVariable } from 'src/front-components/types/fireflies-application-variable.type';

export const shouldDisplayApplicationVariable = (
  variable: FirefliesApplicationVariable,
): boolean => !variable.isDeprecated || isNonEmptyString(variable.value);
