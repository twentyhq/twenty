import { useFullNameField } from '@/object-record/record-field/ui/meta-types/hooks/useFullNameField';
import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FullNameInput } from '@/ui/field/input/components/FullNameInput';

import { addCharactersToAvoidPasswordManagers } from '@/object-record/record-field/ui/meta-types/input/utils/addCharactersToAvoidPasswordManagers';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';

export const FullNameFieldInput = () => {
  const { t } = useLingui();
  const { draftValue, setDraftValue } = useFullNameField();

  const { onEnter, onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );

  const handleChange = (fullName: FieldFullNameValue) => {
    setDraftValue(
      isNonEmptyString(fullName.firstName) ||
        isNonEmptyString(fullName.lastName)
        ? fullName
        : undefined,
    );
  };

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  return (
    <FullNameInput
      instanceId={instanceId}
      value={draftValue}
      placeholder={addCharactersToAvoidPasswordManagers(t`Full name`)}
      firstNamePlaceholder={addCharactersToAvoidPasswordManagers(t`First name`)}
      lastNamePlaceholder={addCharactersToAvoidPasswordManagers(t`Last name`)}
      onChange={handleChange}
      onEnter={(newValue) => onEnter?.({ newValue })}
      onEscape={(newValue) => onEscape?.({ newValue })}
      onTab={(newValue) => onTab?.({ newValue })}
      onShiftTab={(newValue) => onShiftTab?.({ newValue })}
      onClickOutside={(event, newValue) =>
        onClickOutside?.({ newValue, event })
      }
    />
  );
};
