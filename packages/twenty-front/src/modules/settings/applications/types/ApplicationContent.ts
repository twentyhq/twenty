import { type ApplicationContentFieldsFragment } from '~/generated-metadata/graphql';

export type ApplicationContent = Omit<
  ApplicationContentFieldsFragment,
  '__typename'
>;
