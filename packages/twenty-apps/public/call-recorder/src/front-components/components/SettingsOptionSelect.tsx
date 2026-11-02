import styled from '@emotion/styled';
import { useState } from 'react';
import { isDefined } from 'twenty-ui/utilities';

import { DropdownMenuItemsContainer } from 'src/front-components/components/DropdownMenuItemsContainer';
import { DropdownMenuOption } from 'src/front-components/components/DropdownMenuOption';
import { SettingsSelectControl } from 'src/front-components/components/SettingsSelectControl';
import { SettingsSelectMenu } from 'src/front-components/components/SettingsSelectMenu';
import { StyledSettingsSelectAnchor } from 'src/front-components/components/StyledSettingsSelectAnchor';
import { EMPTY_OPTION_LABEL } from 'src/front-components/constants/empty-option-label.constant';
import {
  getNextActiveOptionIndex,
  type SettingsSelectNavigationKey,
} from 'src/front-components/utils/get-next-active-option-index.util';

const StyledListbox = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

type SettingsOptionSelectProps = {
  value: string;
  options: { label: string; value: string }[];
  ariaLabel: string;
  listboxId: string;
  isEmptyAllowed?: boolean;
  onChange: (value: string) => void;
};

export const SettingsOptionSelect = ({
  value,
  options,
  ariaLabel,
  listboxId,
  isEmptyAllowed = false,
  onChange,
}: SettingsOptionSelectProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);
  const getOptionId = (index: number) => `${listboxId}-option-${index}`;

  const selectedOption = options.find((option) => option.value === value);
  const selectableOptions = isEmptyAllowed
    ? [{ label: EMPTY_OPTION_LABEL, value: '' }, ...options]
    : options;
  const selectedOptionIndex = Math.max(
    selectableOptions.findIndex(
      (selectableOption) => selectableOption.value === value,
    ),
    0,
  );

  const handleMenuToggle = () => {
    if (!isMenuOpen) {
      setActiveOptionIndex(selectedOptionIndex);
    }

    setIsMenuOpen((isOpen) => !isOpen);
  };
  const handleMenuClose = () => setIsMenuOpen(false);

  const handleNavigate = (key: SettingsSelectNavigationKey) => {
    setActiveOptionIndex((currentIndex) =>
      getNextActiveOptionIndex({
        key,
        currentIndex,
        optionCount: selectableOptions.length,
      }),
    );
  };

  const handleSelectActive = () => {
    const activeOption = selectableOptions[activeOptionIndex];

    if (isDefined(activeOption)) {
      onChange(activeOption.value);
      handleMenuClose();
    }
  };

  return (
    <StyledSettingsSelectAnchor>
      <SettingsSelectControl
        label={selectedOption?.label ?? EMPTY_OPTION_LABEL}
        ariaLabel={ariaLabel}
        listboxId={listboxId}
        activeDescendantId={getOptionId(activeOptionIndex)}
        isExpanded={isMenuOpen}
        onNavigate={handleNavigate}
        onSelectActive={handleSelectActive}
        onEscape={handleMenuClose}
        onClick={handleMenuToggle}
      />
      <SettingsSelectMenu isOpen={isMenuOpen} onClose={handleMenuClose}>
        <StyledListbox id={listboxId} role="listbox" aria-label={ariaLabel}>
          <DropdownMenuItemsContainer>
            {selectableOptions.map((option, index) => (
              <DropdownMenuOption
                key={option.value}
                id={getOptionId(index)}
                text={option.label}
                selected={option.value === value}
                isActive={index === activeOptionIndex}
                onSelect={() => {
                  onChange(option.value);
                  handleMenuClose();
                }}
              />
            ))}
          </DropdownMenuItemsContainer>
        </StyledListbox>
      </SettingsSelectMenu>
    </StyledSettingsSelectAnchor>
  );
};
