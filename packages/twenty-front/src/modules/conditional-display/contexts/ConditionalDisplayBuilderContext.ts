import { type ConditionalDisplayContextKey } from 'twenty-shared/types';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type ConditionalDisplayBuilderContextType = {
  availableContextKeys: ConditionalDisplayContextKey[];
};

export const [
  ConditionalDisplayBuilderProviderContext,
  useConditionalDisplayBuilderContext,
] = createRequiredContext<ConditionalDisplayBuilderContextType>(
  'ConditionalDisplayBuilderContext',
);
