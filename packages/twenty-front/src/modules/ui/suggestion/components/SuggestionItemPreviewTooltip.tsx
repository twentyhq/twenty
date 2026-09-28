import { css } from '@linaria/core';
import { type ReactNode } from 'react';
import { Tooltip, type TooltipPopupProps } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const previewTooltipClass = css`
  background: transparent !important;
  border-radius: ${themeCssVariables.border.radius.md} !important;
  box-shadow: ${themeCssVariables.boxShadow.strong} !important;
  padding: 0 !important;
`;

type SuggestionItemPreviewTooltipProps = {
  anchor: TooltipPopupProps['anchor'];
  width: number;
  children: ReactNode;
};

export const SuggestionItemPreviewTooltip = ({
  anchor,
  width,
  children,
}: SuggestionItemPreviewTooltipProps) => (
  <Tooltip.Root open>
    <Tooltip.Popup
      anchor={anchor}
      side="right"
      align="start"
      sideOffset={16}
      className={previewTooltipClass}
      maxWidth={`${width}px`}
    >
      {children}
    </Tooltip.Popup>
  </Tooltip.Root>
);
