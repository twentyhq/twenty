import { OverlayMenuListSeparator } from '@/ui/layout/overlay/components/OverlayMenuListSeparator';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: inset 0 0 0 1px ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;

  &:has(input:focus-visible) {
    box-shadow: inset 0 0 0 1px ${themeCssVariables.color.blue};
  }
`;

const StyledItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  padding: ${themeCssVariables.spacing[1]};
`;

type MultiItemFieldInlineListProps = {
  children?: ReactNode;
  footer?: ReactNode;
};

export const MultiItemFieldInlineList = ({
  children,
  footer,
}: MultiItemFieldInlineListProps) => (
  <StyledContainer>
    {isDefined(children) && <StyledItems>{children}</StyledItems>}
    {isDefined(children) && isDefined(footer) && <OverlayMenuListSeparator />}
    {footer}
  </StyledContainer>
);
