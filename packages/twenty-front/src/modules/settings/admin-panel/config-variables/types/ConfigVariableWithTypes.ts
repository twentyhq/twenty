import { ConfigSource } from '~/generated/graphql';

import { ConfigVariableOptions } from './ConfigVariableOptions';

// just realized, on the DTO, we map the value and option to GraphQLJSON
// which gets converted to Scalars['JSON']
// which is not what we want, we want to use the native type
// so we need to convert the value and option to the native type
// before submitting the form
// or we should not map the value and option to GraphQLJSON -- but then we have to handle the type conversion on the frontend
// which is a pain, so we will just convert the value and option to the native type before submitting the form
// TODO: get back to this
export type ConfigVariableWithTypes = {
  name: string;
  description: string;
  value: string | number | boolean | string[] | null;
  isSensitive: boolean;
  isEnvOnly: boolean;
  type?: 'boolean' | 'number' | 'array' | 'enum' | 'string';
  options?: ConfigVariableOptions;
  source: ConfigSource;
};
