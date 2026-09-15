import { createContext } from 'react';
import { type AppTooltipProps } from 'twenty-ui/primitives/surfaces';

type FieldDescriptionTooltipContextValue = {
  tooltipId: string;
  setTooltipContent: (
    content: Pick<AppTooltipProps, 'title' | 'description'>,
  ) => void;
};

export const FieldDescriptionTooltipContext = createContext<
  FieldDescriptionTooltipContextValue | undefined
>(undefined);
