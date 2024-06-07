import camelCase from 'lodash.camelcase';

import { capitalize } from '~/utils/string/capitalize';

export const pascalCase = (str: string) => capitalize(camelCase(str));
