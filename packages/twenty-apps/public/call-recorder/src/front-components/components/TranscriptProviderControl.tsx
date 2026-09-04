import styled from '@emotion/styled';
import { useState } from 'react';

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

const TRANSCRIPT_PROVIDER_LISTBOX_ID = 'call-recorder-transcript-provider';

const getTranscriptProviderOptionId = (index: number) =>
  `${TRANSCRIPT_PROVIDER_LISTBOX_ID}-option-${index}`;

type TranscriptProviderControlProps = {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
};

export const TranscriptProviderControl = ({
  value,
  options,
  onChange,
}: TranscriptProviderControlProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);

  const selectedOption = options.find((option) => option.value === value);
  const selectableOptions = [
    { label: EMPTY_OPTION_LABEL, value: '' },
    ...options,
  ];
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

    if (activeOption) {
      onChange(activeOption.value);
      handleMenuClose();
    }
  };

  return (
    <StyledSettingsSelectAnchor>
      <SettingsSelectControl
        label={selectedOption?.label ?? EMPTY_OPTION_LABEL}
        ariaLabel="Transcript provider"
        listboxId={TRANSCRIPT_PROVIDER_LISTBOX_ID}
        activeDescendantId={getTranscriptProviderOptionId(activeOptionIndex)}
        isExpanded={isMenuOpen}
        onNavigate={handleNavigate}
        onSelectActive={handleSelectActive}
        onEscape={handleMenuClose}
        onClick={handleMenuToggle}
      />
      <SettingsSelectMenu isOpen={isMenuOpen} onClose={handleMenuClose}>
        <StyledListbox
          id={TRANSCRIPT_PROVIDER_LISTBOX_ID}
          role="listbox"
          aria-label="Transcript provider"
        >
          <DropdownMenuItemsContainer>
            {selectableOptions.map((option, index) => (
              <DropdownMenuOption
                key={option.value}
                id={getTranscriptProviderOptionId(index)}
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
