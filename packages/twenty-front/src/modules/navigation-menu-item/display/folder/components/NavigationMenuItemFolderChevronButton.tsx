import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import type React from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { NavigationMenuItemFolderChevron } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderChevron';

const StyledButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  padding: 0;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
  }
`;

type NavigationMenuItemFolderChevronButtonProps = {
  isOpen: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const NavigationMenuItemFolderChevronButton = ({
  isOpen,
  onClick,
}: NavigationMenuItemFolderChevronButtonProps) => {
  const { t } = useLingui();

  return (
    <StyledButton
      type="button"
      aria-label={isOpen ? t`Collapse folder` : t`Expand folder`}
      aria-expanded={isOpen}
      onClick={onClick}
    >
      <NavigationMenuItemFolderChevron isOpen={isOpen} />
    </StyledButton>
  );
};
