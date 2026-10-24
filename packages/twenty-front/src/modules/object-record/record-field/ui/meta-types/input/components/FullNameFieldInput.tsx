import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useFullNameField } from '@/object-record/record-field/ui/meta-types/hooks/useFullNameField';
import { addCharactersToAvoidPasswordManagers } from '@/object-record/record-field/ui/meta-types/input/utils/addCharactersToAvoidPasswordManagers';
import { joinFullName } from '@/object-record/record-field/ui/meta-types/input/utils/joinFullName';
import { trimFullName } from '@/object-record/record-field/ui/meta-types/input/utils/trimFullName';
import { splitFullNameInputText } from '@/object-record/record-field/ui/meta-types/input/utils/splitFullNameInputText';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { FieldInputDetailsToggleRow } from '@/ui/field/input/components/FieldInputDetailsToggleRow';
import { StyledFieldInputDetails } from '@/ui/field/input/components/StyledFieldInputDetails';
import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { TextInput } from '@/ui/input/components/TextInput';
import { PASSWORD_MANAGER_IGNORE_ATTRIBUTES } from '@/ui/input/constants/PasswordManagerIgnoreAttributes';
import { useRegisterInputEvents } from '@/ui/input/hooks/useRegisterInputEvents';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledFullNameContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const FullNameFieldInput = () => {
  const { t } = useLingui();
  const { draftValue, setDraftValue } = useFullNameField();

  const { onEnter, onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const [fullName, setFullName] = useState<FieldFullNameValue>({
    firstName: draftValue?.firstName ?? '',
    lastName: draftValue?.lastName ?? '',
  });
  const [fullNameText, setFullNameText] = useState(() =>
    joinFullName(fullName),
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [focusedInputIndex, setFocusedInputIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);

  const focusableInputRefs = isExpanded
    ? [fullNameInputRef, firstNameInputRef, lastNameInputRef]
    : [fullNameInputRef];

  const updateFullName = (nextFullName: FieldFullNameValue) => {
    const trimmedFullName = trimFullName(nextFullName);

    setFullName(nextFullName);
    setDraftValue(
      isNonEmptyString(trimmedFullName.firstName) ||
        isNonEmptyString(trimmedFullName.lastName)
        ? trimmedFullName
        : undefined,
    );
  };

  const handleFullNameTextChange = (text: string) => {
    setFullNameText(text);
    updateFullName(splitFullNameInputText({ text, currentFullName: fullName }));
  };

  const handleNamePartChange = (nextFullName: FieldFullNameValue) => {
    setFullNameText(joinFullName(nextFullName));
    updateFullName(nextFullName);
  };

  const handleTab = (currentFullName: FieldFullNameValue) => {
    const nextInputRef = focusableInputRefs[focusedInputIndex + 1];

    if (isDefined(nextInputRef)) {
      nextInputRef.current?.focus();
      return;
    }

    onTab?.({ newValue: trimFullName(currentFullName) });
  };

  const handleShiftTab = (currentFullName: FieldFullNameValue) => {
    const previousInputRef = focusableInputRefs[focusedInputIndex - 1];

    if (isDefined(previousInputRef)) {
      previousInputRef.current?.focus();
      return;
    }

    onShiftTab?.({ newValue: trimFullName(currentFullName) });
  };

  useRegisterInputEvents({
    focusId: instanceId,
    inputRef: containerRef,
    inputValue: fullName,
    onEnter: (currentFullName) =>
      onEnter?.({ newValue: trimFullName(currentFullName) }),
    onEscape: (currentFullName) =>
      onEscape?.({ newValue: trimFullName(currentFullName) }),
    onTab: handleTab,
    onShiftTab: handleShiftTab,
    onClickOutside: (event, currentFullName) =>
      onClickOutside?.({ newValue: trimFullName(currentFullName), event }),
  });

  return (
    <FieldInputContainer>
      <StyledFullNameContainer ref={containerRef}>
        <FieldInputDetailsToggleRow
          isExpanded={isExpanded}
          toggleLabel={t`Name details`}
          onToggle={() => {
            if (isExpanded) {
              fullNameInputRef.current?.focus();
            }
            setIsExpanded(!isExpanded);
          }}
        >
          <StyledTextInput
            ref={fullNameInputRef}
            autoFocus
            autoComplete="off"
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...PASSWORD_MANAGER_IGNORE_ATTRIBUTES}
            aria-label={t`Full name`}
            placeholder={addCharactersToAvoidPasswordManagers(t`Full name`)}
            value={fullNameText}
            onChange={(event) => handleFullNameTextChange(event.target.value)}
            onFocus={() => setFocusedInputIndex(0)}
            onClick={(event) => event.stopPropagation()}
          />
        </FieldInputDetailsToggleRow>
        {isExpanded && (
          <StyledFieldInputDetails>
            <TextInput
              ref={firstNameInputRef}
              label={t`First name`}
              value={fullName.firstName}
              placeholder={addCharactersToAvoidPasswordManagers(t`First name`)}
              fullWidth
              ignorePasswordManagers
              onChange={(firstName) =>
                handleNamePartChange({ ...fullName, firstName })
              }
              onFocus={() => setFocusedInputIndex(1)}
            />
            <TextInput
              ref={lastNameInputRef}
              label={t`Last name`}
              value={fullName.lastName}
              placeholder={addCharactersToAvoidPasswordManagers(t`Last name`)}
              fullWidth
              ignorePasswordManagers
              onChange={(lastName) =>
                handleNamePartChange({ ...fullName, lastName })
              }
              onFocus={() => setFocusedInputIndex(2)}
            />
          </StyledFieldInputDetails>
        )}
      </StyledFullNameContainer>
    </FieldInputContainer>
  );
};
