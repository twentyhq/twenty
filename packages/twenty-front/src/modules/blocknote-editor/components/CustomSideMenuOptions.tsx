import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type IconComponent } from 'twenty-ui/display';

const StyledContainer = styled.div<{ Variant: Variants }>`
  color: ${({ theme, Variant }) =>
    Variant === 'danger' ? theme.color.red : 'inherit'};
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
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
  const theme = useTheme();
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
