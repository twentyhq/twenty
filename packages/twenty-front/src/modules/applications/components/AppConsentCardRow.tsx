import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

type AppConsentCardRowProps = {
  Icon: IconComponent;
  children: ReactNode;
};

const StyledRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledIcon = styled.div`
  color: ${themeCssVariables.color.blue9};
  display: flex;
`;

export const AppConsentCardRow = ({
  Icon,
  children,
}: AppConsentCardRowProps) => (
  <StyledRow>
    <StyledIcon>
      <Icon size={16} aria-hidden />
    </StyledIcon>
    {children}
  </StyledRow>
);
