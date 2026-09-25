import { type ValidationRuleFragmentFragment } from '~/generated-metadata/graphql';

export type ValidationRule = Omit<ValidationRuleFragmentFragment, '__typename'>;
