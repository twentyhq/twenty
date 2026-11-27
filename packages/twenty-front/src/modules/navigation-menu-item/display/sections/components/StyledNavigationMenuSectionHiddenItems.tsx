import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledNavigationMenuSectionHiddenItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  padding-bottom: ${themeCssVariables.betweenSiblingsGap};
`;
