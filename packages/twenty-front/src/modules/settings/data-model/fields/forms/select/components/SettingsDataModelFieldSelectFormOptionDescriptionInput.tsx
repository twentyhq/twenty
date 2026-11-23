import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type KeyboardEvent } from 'react';
import { Key } from 'ts-key-enum';
import { OPTION_DESCRIPTION_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { Dropdown } from 'twenty-ui/components/navigation';

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
  const { t } = useLingui();
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
      <DropdownMenuInput
        instanceId={`${dropdownId}-description`}
        value={description ?? ''}
        placeholder={t`Add a description`}
        maxLength={OPTION_DESCRIPTION_MAX_CHAR_LENGTH}
        onChange={(event) =>
          onChange(
            isNonEmptyString(event.target.value.trim())
              ? event.target.value
              : null,
          )
        }
      />
    </Dropdown.Section>
  );
};
