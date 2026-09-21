import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { type KeyboardEvent, type ReactNode, useRef } from 'react';
import { IconChevronDown } from 'twenty-ui/icon';
import { ICON } from 'twenty-ui/theme';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type SettingsSelectNavigationKey } from 'src/front-components/utils/get-next-active-option-index.util';

const StyledControlContainer = styled.button<{
  $hasAdornment: boolean;
}>`
  appearance: none;
  align-items: center;
  background-color: ${() => themeCssVariables.background.transparent.light};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.primary};
  cursor: pointer;
  display: grid;
  font: inherit;
  gap: ${() => themeCssVariables.spacing[1]};
  grid-template-columns: ${({ $hasAdornment }) =>
    $hasAdornment ? 'auto 1fr auto' : '1fr auto'};
  height: ${() => themeCssVariables.spacing[6]};
  max-width: 100%;
  padding: 0 ${() => themeCssVariables.spacing[2]};
  text-align: left;

  &:disabled {
    color: ${() => themeCssVariables.font.color.secondary};
    cursor: not-allowed;
  }
`;

const StyledChevronWrapper = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  pointer-events: none;
`;

type SettingsSelectControlProps = {
  label: string;
  ariaLabel: string;
  listboxId: string;
  activeDescendantId: string | undefined;
  adornment?: ReactNode;
  disabled?: boolean;
  isExpanded: boolean;
  onNavigate: (key: SettingsSelectNavigationKey) => void;
  onSelectActive: () => void;
  onEscape: () => void;
  onClick: () => void;
};

export const SettingsSelectControl = ({
  label,
  ariaLabel,
  listboxId,
  activeDescendantId,
  adornment,
  disabled = false,
  isExpanded,
  onNavigate,
  onSelectActive,
  onEscape,
  onClick,
}: SettingsSelectControlProps) => {
  const shouldIgnoreNextClickRef = useRef(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Tab' && isExpanded) {
      onEscape();

      return;
    }

    if (event.key === 'Escape' && isExpanded) {
      onEscape();

      return;
    }

    if (!isExpanded && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      onClick();

      return;
    }

    if (
      isExpanded &&
      (event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Home' ||
        event.key === 'End')
    ) {
      event.preventDefault();
      onNavigate(event.key);

      return;
    }

    if (isExpanded && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      shouldIgnoreNextClickRef.current = true;
      onSelectActive();
    }
  };

  const handleClick = () => {
    if (shouldIgnoreNextClickRef.current) {
      shouldIgnoreNextClickRef.current = false;

      return;
    }

    onClick();
  };

  return (
    <StyledControlContainer
      type="button"
      role="combobox"
      $hasAdornment={!isUndefined(adornment)}
      disabled={disabled}
      aria-label={`${ariaLabel}: ${label}`}
      aria-expanded={isExpanded}
      aria-haspopup="listbox"
      aria-controls={listboxId}
      aria-activedescendant={isExpanded ? activeDescendantId : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {adornment}
      <OverflowingTextWithTooltip text={label} />
      <StyledChevronWrapper>
        <IconChevronDown size={ICON.size.md} stroke={ICON.stroke.sm} />
      </StyledChevronWrapper>
    </StyledControlContainer>
  );
};
