import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type KeyboardEvent, useRef } from 'react';
import { Key } from 'ts-key-enum';
import { OPTION_DESCRIPTION_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { Dropdown } from 'twenty-ui/components/navigation';
import { SettingsDataModelFieldSelectFormOptionDescriptionFocusEffect } from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectFormOptionDescriptionFocusEffect';

type SettingsDataModelFieldSelectFormOptionDescriptionInputProps = {
  dropdownId: string;
  description?: string | null;
  onChange: (description: string | null) => void;
};

export const SettingsDataModelFieldSelectFormOptionDescriptionInput = ({
  dropdownId,
  description,
  onChange,
}: SettingsDataModelFieldSelectFormOptionDescriptionInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { closeDropdown } = useCloseDropdown();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key !== Key.Enter ||
      isKeyboardEventComposing(event.nativeEvent)
    ) {
      return;
    }

    event.preventDefault();
    closeDropdown(dropdownId);
  };

  return (
    <Dropdown.Section onKeyDown={handleKeyDown}>
      <SettingsDataModelFieldSelectFormOptionDescriptionFocusEffect
        inputRef={inputRef}
      />
      <DropdownMenuInput
        ref={inputRef}
        instanceId={`${dropdownId}-description`}
        value={description ?? ''}
        placeholder={t`Add a description`}
        onChange={(event) => {
          const nextDescription = event.target.value.slice(
            0,
            OPTION_DESCRIPTION_MAX_CHAR_LENGTH,
          );

          onChange(
            isNonEmptyString(nextDescription.trim()) ? nextDescription : null,
          );
        }}
      />
    </Dropdown.Section>
  );
};
