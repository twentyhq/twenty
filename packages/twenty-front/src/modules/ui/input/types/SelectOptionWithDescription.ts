import { type SelectOption } from 'twenty-ui/primitives/input';

export type SelectOptionWithDescription = SelectOption & {
  description?: string | null;
};
