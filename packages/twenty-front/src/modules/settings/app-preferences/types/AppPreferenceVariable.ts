import { type UserApplicationVariableValue } from '~/generated-metadata/graphql';

export type AppPreferenceVariable = Omit<
  UserApplicationVariableValue,
  'options'
> & {
  options?: unknown;
};
