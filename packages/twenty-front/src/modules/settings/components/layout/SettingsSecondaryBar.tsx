import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// The secondary row between the header and the body. The top separator is a
// border; the bottom separator is an ::after pinned to the bottom edge (not a
// border, which box-sizing would keep 1px inside) so the active tab's underline
// — its own ::after at bottom: 0 of a full-height tab — lands exactly on this
// line. align-items stays at its default (stretch) so the tab fills the bar
// height and its underline reaches the bottom instead of floating mid-bar.
const StyledSecondaryBar = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  min-height: ${themeCssVariables.spacing[10]};
  padding: 0 ${themeCssVariables.spacing[3]};
  position: relative;
  width: 100%;

  &::after {
    background-color: ${themeCssVariables.border.color.light};
    bottom: 0;
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
  }
`;

export const SettingsSecondaryBar = ({ children }: { children: ReactNode }) => (
  <StyledSecondaryBar>{children}</StyledSecondaryBar>
);
