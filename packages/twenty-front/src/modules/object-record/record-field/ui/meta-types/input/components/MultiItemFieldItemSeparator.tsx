import { OverlayMenuListSeparator } from '@/ui/layout/overlay/components/OverlayMenuListSeparator';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledItemSeparator = styled.div`
  margin: ${themeCssVariables.betweenSiblingsGap}
    calc(-1 * ${themeCssVariables.spacing[1]});
`;

export const MultiItemFieldItemSeparator = () => (
  <StyledItemSeparator>
    <OverlayMenuListSeparator />
  </StyledItemSeparator>
);
