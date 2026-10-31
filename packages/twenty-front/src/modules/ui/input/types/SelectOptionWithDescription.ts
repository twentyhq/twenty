import { type SelectValue } from '@/ui/input/components/internal/select/types';
import { type SelectOption } from 'twenty-ui/primitives/input';

export type SelectOptionWithDescription<TValue extends SelectValue = string> =
  SelectOption<TValue> & {
    description?: string | null;
  };
