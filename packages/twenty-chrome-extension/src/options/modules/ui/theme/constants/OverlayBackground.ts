import { css } from '@emotion/react';

import { ThemeType } from '@/ui/theme/constants/ThemeLight';

export const OVERLAY_BACKGROUND = (props: { theme: ThemeType }) => css`
  backdrop-filter: blur(12px) saturate(200%) contrast(50%) brightness(130%);
  background: ${props.theme.background.transparent.secondary};
  box-shadow: ${props.theme.boxShadow.strong};
`;
