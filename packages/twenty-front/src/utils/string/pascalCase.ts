import camelCase from 'lodash.camelcase';
import { capitalize } from 'twenty-shared/utils';

export const pascalCase = (str: string) => capitalize(camelCase(str));
