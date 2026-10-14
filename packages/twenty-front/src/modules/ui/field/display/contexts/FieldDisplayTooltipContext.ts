import { createContext } from 'react';

import { type FieldDisplayTooltipContextValue } from '@/ui/field/display/types/FieldDisplayTooltipContextValue';

const DEFAULT_FIELD_DISPLAY_TOOLTIP_CONTEXT_VALUE: FieldDisplayTooltipContextValue =
  {
    withTooltip: true,
    measureOverflowOnOpen: false,
  };

export const FieldDisplayTooltipContext =
  createContext<FieldDisplayTooltipContextValue>(
    DEFAULT_FIELD_DISPLAY_TOOLTIP_CONTEXT_VALUE,
  );
