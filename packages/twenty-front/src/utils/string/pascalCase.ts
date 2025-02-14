import camelCase from 'lodash.camelcase';

import { capitalize } from 'twenty-shared';

export const pascalCase = (str: string) => capitalize(camelCase(str));
