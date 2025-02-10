import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

type StyledButtonProps = {
  id: string;
  title: string;
  Icon: IconComponent;
  className?: string;
  dropdownContent?: React.ReactNode;
  dropdownPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  onDropdownOpen?: () => void;
  onDropdownClose?: () => void;
};

const StyledButton = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  background-color: transparent;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2) + ' 0'};
`;

const StyledHover = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

const StyledButtonContent = ({
  title,
  Icon,
  theme,
}: {
  title: string;
  Icon: IconComponent;
  theme: any;
}) => (
  <StyledHover>
    {title}
    <Icon size={14} color={theme.font.color.secondary} />
  </StyledHover>
);

export const MoreButton = ({
  id,
  title,
  Icon,
  className,
  dropdownContent,
  dropdownPlacement = 'bottom-start',
  onDropdownOpen,
  onDropdownClose,
}: StyledButtonProps) => {
  const theme = useTheme();

  if (!dropdownContent) {
    return (
      <StyledButton className={className} data-testid={'button-' + id}>
        <StyledButtonContent title={title} Icon={Icon} theme={theme} />
      </StyledButton>
    );
  }

  // Define a basic hotkey scope for the dropdown
  const dropdownHotkeyScope: HotkeyScope = {
    scope: `dropdown-${id}`,
  };

  return (
    <Dropdown
      dropdownId={`more-button-${id}-dropdown`}
      dropdownHotkeyScope={dropdownHotkeyScope}
      dropdownPlacement={dropdownPlacement}
      dropdownComponents={dropdownContent}
      onOpen={onDropdownOpen}
      onClose={onDropdownClose}
      clickableComponent={
        <StyledButton className={className} data-testid={'button-' + id}>
          <StyledButtonContent title={title} Icon={Icon} theme={theme} />
        </StyledButton>
      }
    />
  );
};
