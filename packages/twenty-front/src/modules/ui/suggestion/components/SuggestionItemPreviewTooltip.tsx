import { css } from '@linaria/core';
import { type ReactNode } from 'react';
import {
  Tooltip,
  type TooltipPositionerProps,
} from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const previewTooltipClass = css`
  background: transparent !important;
  border-radius: ${themeCssVariables.border.radius.md} !important;
  box-shadow: ${themeCssVariables.boxShadow.strong} !important;
  padding: 0 !important;

  [data-anchor-hidden] & {
    visibility: hidden;
  }
`;

type SuggestionItemPreviewTooltipProps = {
  anchor: TooltipPositionerProps['anchor'];
  width: number;
  children: ReactNode;
};

export const SuggestionItemPreviewTooltip = ({
  anchor,
  width,
  children,
}: SuggestionItemPreviewTooltipProps) => (
  <Tooltip.Root open>
    <Tooltip.Portal>
      <Tooltip.Positioner
        anchor={anchor}
        side="right"
        align="start"
        sideOffset={16}
        style={{ maxWidth: `${width}px` }}
      >
        <Tooltip.Popup className={previewTooltipClass}>
          {children}
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
);
