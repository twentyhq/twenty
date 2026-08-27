import { MenuItemSelect } from 'twenty-ui/navigation';

import { DropdownMenuItemsContainer } from 'src/front-components/components/DropdownMenuItemsContainer';
import { FloatingMenu } from 'src/front-components/components/FloatingMenu';
import { SettingsSelectControl } from 'src/front-components/components/SettingsSelectControl';
import { EMPTY_OPTION_LABEL } from 'src/front-components/constants/empty-option-label.constant';
import { FLOATING_MENU_DEFAULT_WIDTH_PIXELS } from 'src/front-components/constants/floating-menu.constant';
import { useAnchoredMenu } from 'src/front-components/hooks/use-anchored-menu';
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
  const { anchorRef, anchorRect, isOpen, close, toggle } = useAnchoredMenu();

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div ref={anchorRef}>
      <SettingsSelectControl
        label={selectedOption?.label ?? EMPTY_OPTION_LABEL}
        onClick={toggle}
      />
      {isOpen && anchorRect !== undefined && (
        <FloatingMenu
          anchorRect={anchorRect}
          width={Math.max(anchorRect.width, FLOATING_MENU_DEFAULT_WIDTH_PIXELS)}
          onClose={close}
        >
          <DropdownMenuItemsContainer>
            {options.map((option) => (
              <MenuItemSelect
                key={option.value}
                text={option.label}
                selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  close();
                }}
              />
            ))}
          </DropdownMenuItemsContainer>
        </FloatingMenu>
      )}
    </div>
  );
};
