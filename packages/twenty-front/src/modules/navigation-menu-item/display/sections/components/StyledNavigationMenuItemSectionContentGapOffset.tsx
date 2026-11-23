import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledNavigationMenuItemSectionContentGapOffset = styled.div`
  margin-top: calc(-1 * ${themeCssVariables.betweenSiblingsGap});
`;
