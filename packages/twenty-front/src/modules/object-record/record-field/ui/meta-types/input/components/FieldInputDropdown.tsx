import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldInputAnchorContextOrThrow } from '@/object-record/record-field/ui/contexts/FieldInputAnchorContext';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { preventDropdownDismissOnInputElement } from '@/ui/layout/dropdown/utils/preventDropdownDismissOnInputElement';
import { type KeyboardEvent, type ReactNode, useContext } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

type FieldInputDropdownProps<TValue> = {
  children: ReactNode;
  value: TValue;
  onDismiss: () => void;
  multiple?: boolean;
};

export const FieldInputDropdown = <TValue,>({
  children,
  value,
  onDismiss,
  multiple,
}: FieldInputDropdownProps<TValue>) => {
  const { fieldDefinition } = useContext(FieldContext);
  const { onTab, onShiftTab } = useContext(FieldInputEventContext);
  const { anchorRef, align, sideOffset, alignOffset, collisionPadding } =
    useFieldInputAnchorContextOrThrow();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onDismiss();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== Key.Tab) {
      return;
    }

    const handleTab = event.shiftKey ? onShiftTab : onTab;

    if (!isDefined(handleTab)) {
      onDismiss();
      return;
    }

    event.preventDefault();
    handleTab({ newValue: value });
  };

  return (
    <Dropdown.Root
      type="picker"
      multiple={multiple}
      open
      onOpenChange={handleOpenChange}
      onInteractOutside={preventDropdownDismissOnInputElement}
    >
      <DropdownContent
        anchor={anchorRef}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        aria-label={fieldDefinition.label}
        finalFocus={false}
        onKeyDown={handleKeyDown}
      >
        {children}
      </DropdownContent>
    </Dropdown.Root>
  );
};
