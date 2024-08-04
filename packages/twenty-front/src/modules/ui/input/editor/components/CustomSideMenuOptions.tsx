import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';

const StyledContainer = styled.div<{ variant: variants }>`
  color: ${({ theme, variant }) =>
    variant === 'Danger' ? theme.color.red : 'inherit'};
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const StyledTextContainer = styled.div``;

type CustomSideMenuOptionsProps = {
  LeftIcon: IconComponent; // Any valid React node (e.g., a component)
  variant: variants;
  text: string;
};

type variants = 'Normal' | 'Danger';

export const CustomSideMenuOptions = ({
  LeftIcon,
  variant,
  text,
}: CustomSideMenuOptionsProps) => {
  const theme = useTheme();
  return (
    <StyledContainer variant={variant}>
      <LeftIcon
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.sm}
      ></LeftIcon>
      <StyledTextContainer>{text}</StyledTextContainer>
    </StyledContainer>
  );
};
