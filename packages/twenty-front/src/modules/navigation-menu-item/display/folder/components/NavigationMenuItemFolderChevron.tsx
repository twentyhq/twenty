import { styled } from '@linaria/react';
import { IconChevronRight } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledContainer = styled.span<{ isOpen: boolean }>`
  display: inline-flex;
  transform: rotate(${({ isOpen }) => (isOpen ? 90 : 0)}deg);
  transition: transform
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

type NavigationMenuItemFolderChevronProps = {
  isOpen: boolean;
};

export const NavigationMenuItemFolderChevron = ({
  isOpen,
}: NavigationMenuItemFolderChevronProps) => {
  const theme = useTheme();

  return (
    <StyledContainer isOpen={isOpen}>
      <IconChevronRight
        size={theme.icon.size.sm}
        stroke={theme.icon.stroke.sm}
        color={themeCssVariables.font.color.tertiary}
      />
    </StyledContainer>
  );
};
