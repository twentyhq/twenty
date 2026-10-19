import { styled } from '@linaria/react';
import { IconChevronRight } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledContainer = styled.span`
  color: ${themeCssVariables.font.color.light};
  display: inline-flex;

  &[data-opened='true'] {
    transform: rotate(90deg);
  }

  &[data-disabled='true'] {
    visibility: hidden;
  }
`;

type ListItemSubmenuIndicatorProps = {
  isOpen: boolean;
  disabled?: boolean;
};

export const ListItemSubmenuIndicator = ({
  isOpen,
  disabled = false,
}: ListItemSubmenuIndicatorProps) => {
  const theme = useTheme();

  return (
    <StyledContainer aria-hidden data-opened={isOpen} data-disabled={disabled}>
      <IconChevronRight
        size={theme.icon.size.sm}
        stroke={theme.icon.stroke.sm}
      />
    </StyledContainer>
  );
};
