import { useContext } from 'react';
import { type OverflowingTextWithTooltipProps } from 'twenty-ui/primitives/typography';

import { FieldDisplayTooltipContext } from '@/ui/field/display/contexts/FieldDisplayTooltipContext';

export const useFieldDisplayTooltipProps = (): Pick<
  OverflowingTextWithTooltipProps,
  'withTooltip' | 'initialPointerPosition'
> => {
  const { withTooltip, getInitialPointerPosition } = useContext(
    FieldDisplayTooltipContext,
  );

  return {
    withTooltip,
    initialPointerPosition: withTooltip
      ? getInitialPointerPosition?.()
      : undefined,
  };
};
