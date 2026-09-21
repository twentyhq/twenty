import { styled } from '@linaria/react';
import { IconDos } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledAppLogoContainer = styled.div<{ size?: number }>`
  align-items: center;
  background-color: ${themeCssVariables.background.invertedPrimary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  height: ${({ size }) => (size ? `${size}px` : '100%')};
  justify-content: center;
  width: ${({ size }) => (size ? `${size}px` : '100%')};
`;

export const AppLogo = ({ size }: { size?: number }) => {
  const iconSize = size ? Math.round(size * 0.65) : 32;

  return (
    <StyledAppLogoContainer size={size}>
      <IconDos size={iconSize} />
    </StyledAppLogoContainer>
  );
};
