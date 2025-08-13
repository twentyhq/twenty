import { type Theme } from '@emotion/react';

export const getTriggerIconColor = ({ theme }: { theme: Theme }) => {
  return theme.font.color.tertiary;
};
