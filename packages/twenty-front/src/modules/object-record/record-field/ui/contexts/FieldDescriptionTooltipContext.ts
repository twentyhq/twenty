import { type FieldDescriptionTooltipContent } from '@/object-record/record-field/ui/types/FieldDescriptionTooltipContent';
import { createContext } from 'react';
import { type Tooltip } from 'twenty-ui/primitives/surfaces';

type FieldDescriptionTooltipHandle = ReturnType<
  typeof Tooltip.createHandle<FieldDescriptionTooltipContent>
>;

export const FieldDescriptionTooltipContext = createContext<
  FieldDescriptionTooltipHandle | undefined
>(undefined);
