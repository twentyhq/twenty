import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  height: 39px;
  padding: 0 ${themeCssVariables.spacing[3]};
`;

type CoreObjectPageHeaderProps = {
  Icon: IconComponent;
  title: string;
};

export const CoreObjectPageHeader = ({
  Icon,
  title,
}: CoreObjectPageHeaderProps) => (
  <StyledHeader>
    <Icon size={16} />
    {title}
  </StyledHeader>
);
