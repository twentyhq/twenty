import { type ValidationRuleBindings } from 'twenty-shared/types';

import { type ValidationRuleFragmentFragment } from '~/generated-metadata/graphql';

export type ValidationRule = Omit<
  ValidationRuleFragmentFragment,
  '__typename' | 'bindings'
> & {
  bindings: ValidationRuleBindings;
};
