import { isNonEmptyString } from '@sniptt/guards';

import { type ApplicationVariable } from '~/generated-metadata/graphql';

export const getApplicationVariableDisplayLabel = ({
  key,
  label,
}: Pick<ApplicationVariable, 'key' | 'label'>): string =>
  isNonEmptyString(label) ? label : key;
