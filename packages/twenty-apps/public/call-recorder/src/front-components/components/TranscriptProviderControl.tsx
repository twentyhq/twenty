import { useRef, useState } from 'react';
import { MenuItemSelect } from 'twenty-ui/navigation';

import { DropdownMenuItemsContainer } from 'src/front-components/components/DropdownMenuItemsContainer';
import { FloatingMenu } from 'src/front-components/components/FloatingMenu';
import { SettingsSelectControl } from 'src/front-components/components/SettingsSelectControl';
import { EMPTY_OPTION_LABEL } from 'src/front-components/constants/empty-option-label.constant';
import { type CallRecorderApplicationVariableOption } from 'src/front-components/types/call-recorder-application-variable.type';

type TranscriptProviderControlProps = {
  value: string;
  options: CallRecorderApplicationVariableOption[];
  onChange: (value: string) => void;
};

export const TranscriptProviderControl = ({
  value,
  options,
  onChange,
}: TranscriptProviderControlProps) => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  const handleMenuToggle = () => setIsMenuOpen((isOpen) => !isOpen);
  const handleMenuClose = () => setIsMenuOpen(false);

  return (
    <div ref={anchorRef}>
      <SettingsSelectControl
        label={selectedOption?.label ?? EMPTY_OPTION_LABEL}
        onClick={handleMenuToggle}
      />
      {isMenuOpen && (
        <FloatingMenu anchorRef={anchorRef} onClose={handleMenuClose}>
          <DropdownMenuItemsContainer>
            {options.map((option) => (
              <MenuItemSelect
                key={option.value}
                text={option.label}
                selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  handleMenuClose();
                }}
              />
            ))}
          </DropdownMenuItemsContainer>
        </FloatingMenu>
      )}
    </div>
  );
};
