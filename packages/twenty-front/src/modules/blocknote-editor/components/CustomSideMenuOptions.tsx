import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type IconComponent } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div<{ Variant: Variants }>`
  color: ${({ Variant }) =>
    Variant === 'danger' ? themeCssVariables.color.red : 'inherit'};
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTextContainer = styled.div``;

type CustomSideMenuOptionsProps = {
  LeftIcon: IconComponent; // Any valid React node (e.g., a component)
  Variant: Variants;
  text: string;
};

type Variants = 'normal' | 'danger';

export const CustomSideMenuOptions = ({
  LeftIcon,
  Variant,
  text,
}: CustomSideMenuOptionsProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer Variant={Variant}>
      <LeftIcon
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.sm}
      ></LeftIcon>
      <StyledTextContainer>{text}</StyledTextContainer>
    </StyledContainer>
  );
};
