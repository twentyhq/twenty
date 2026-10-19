import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FIELD_INPUT_ANCHOR_WIDTH_CSS_VARIABLE } from '@/ui/field/input/constants/FieldInputAnchorWidthCssVariable';
import { FieldInputDetailsToggleRow } from '@/ui/field/input/components/FieldInputDetailsToggleRow';
import { StyledFieldInputDetailsSeparator } from '@/ui/field/input/components/StyledFieldInputDetailsSeparator';
import { StyledFieldInputInlineContainer } from '@/ui/field/input/components/StyledFieldInputInlineContainer';
import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { type FieldInputVariant } from '@/ui/field/input/types/FieldInputVariant';
import { splitFullNameInputText } from '@/ui/field/input/utils/splitFullNameInputText';
import { TextInput } from '@/ui/input/components/TextInput';
import { PASSWORD_MANAGER_IGNORE_ATTRIBUTES } from '@/ui/input/constants/PasswordManagerIgnoreAttributes';
import { useRegisterInputEvents } from '@/ui/input/hooks/useRegisterInputEvents';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFloatingFullNameContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: max(200px, var(${FIELD_INPUT_ANCHOR_WIDTH_CSS_VARIABLE}, 0px));
  width: 100%;
`;

const StyledFullNameDetailsContainer = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: ${themeCssVariables.spacing[2]};
`;

const EMPTY_FULL_NAME: FieldFullNameValue = { firstName: '', lastName: '' };

const trimFullName = ({
  firstName,
  lastName,
}: FieldFullNameValue): FieldFullNameValue => ({
  firstName: firstName.trim(),
  lastName: lastName.trim(),
});

const joinFullName = ({ firstName, lastName }: FieldFullNameValue) =>
  [firstName.trim(), lastName.trim()].filter(isNonEmptyString).join(' ');

const isSameFullName = (
  fullName: FieldFullNameValue,
  otherFullName: FieldFullNameValue,
) =>
  fullName.firstName.trim() === otherFullName.firstName.trim() &&
  fullName.lastName.trim() === otherFullName.lastName.trim();

type FullNameInputProps = {
  instanceId: string;
  value?: FieldFullNameValue | null;
  onChange?: (value: FieldFullNameValue) => void;
  onEnter?: (value: FieldFullNameValue) => void;
  onEscape?: (value: FieldFullNameValue) => void;
  onTab?: (value: FieldFullNameValue) => void;
  onShiftTab?: (value: FieldFullNameValue) => void;
  onClickOutside?: (
    event: MouseEvent | TouchEvent,
    value: FieldFullNameValue,
  ) => void;
  variant?: FieldInputVariant;
  inputId?: string;
  placeholder: string;
  firstNamePlaceholder: string;
  lastNamePlaceholder: string;
  disabled?: boolean;
};

export const FullNameInput = ({
  instanceId,
  value,
  onChange,
  onEnter,
  onEscape,
  onTab,
  onShiftTab,
  onClickOutside,
  variant = 'floating',
  inputId,
  placeholder,
  firstNamePlaceholder,
  lastNamePlaceholder,
  disabled,
}: FullNameInputProps) => {
  const isInline = variant === 'inline';
  const fullNameValue = value ?? EMPTY_FULL_NAME;

  const [fullName, setFullName] = useState(fullNameValue);
  const [fullNameText, setFullNameText] = useState(joinFullName(fullNameValue));
  const [previousValue, setPreviousValue] = useState(fullNameValue);
  const [isExpanded, setIsExpanded] = useState(false);
  const [focusedInputIndex, setFocusedInputIndex] = useState(0);

  if (fullNameValue !== previousValue) {
    setPreviousValue(fullNameValue);

    if (!isSameFullName(fullNameValue, fullName)) {
      setFullName(fullNameValue);
      setFullNameText(joinFullName(fullNameValue));
    }
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);

  const focusableInputRefs = isExpanded
    ? [fullNameInputRef, firstNameInputRef, lastNameInputRef]
    : [fullNameInputRef];

  const updateFullName = (nextFullName: FieldFullNameValue) => {
    setFullName(nextFullName);
    onChange?.(trimFullName(nextFullName));
  };

  const handleFullNameTextChange = (text: string) => {
    setFullNameText(text);
    updateFullName(splitFullNameInputText(text, fullName.firstName));
  };

  const handleSubFieldChange =
    (subField: keyof FieldFullNameValue) => (subFieldValue: string) => {
      const nextFullName = { ...fullName, [subField]: subFieldValue };

      setFullNameText(joinFullName(nextFullName));
      updateFullName(nextFullName);
    };

  const handleTab = () => {
    const nextInputRef = focusableInputRefs[focusedInputIndex + 1];

    if (!isDefined(nextInputRef)) {
      onTab?.(trimFullName(fullName));
      return;
    }

    nextInputRef.current?.focus();
  };

  const handleShiftTab = () => {
    const previousInputRef = focusableInputRefs[focusedInputIndex - 1];

    if (!isDefined(previousInputRef)) {
      onShiftTab?.(trimFullName(fullName));
      return;
    }

    previousInputRef.current?.focus();
  };

  useRegisterInputEvents({
    focusId: instanceId,
    inputRef: containerRef,
    inputValue: fullName,
    onEnter: (currentFullName) => onEnter?.(trimFullName(currentFullName)),
    onEscape: (currentFullName) => onEscape?.(trimFullName(currentFullName)),
    onTab: handleTab,
    onShiftTab: handleShiftTab,
    onClickOutside: isInline
      ? undefined
      : (event, currentFullName) =>
          onClickOutside?.(event, trimFullName(currentFullName)),
  });

  const FullNameContainer = isInline
    ? StyledFieldInputInlineContainer
    : StyledFloatingFullNameContainer;

  return (
    <FullNameContainer ref={containerRef}>
      <FieldInputDetailsToggleRow
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        toggleLabel={t`Name details`}
        disabled={disabled}
      >
        <StyledTextInput
          id={inputId}
          ref={fullNameInputRef}
          autoComplete="off"
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...PASSWORD_MANAGER_IGNORE_ATTRIBUTES}
          autoFocus={!isInline}
          aria-label={isDefined(inputId) ? undefined : t`Full name`}
          placeholder={placeholder}
          value={fullNameText}
          disabled={disabled}
          onChange={(event) => handleFullNameTextChange(event.target.value)}
          onFocus={() => setFocusedInputIndex(0)}
        />
      </FieldInputDetailsToggleRow>
      {isExpanded && (
        <>
          <StyledFieldInputDetailsSeparator />
          <StyledFullNameDetailsContainer>
            <TextInput
              ref={firstNameInputRef}
              label={t`First name`}
              value={fullName.firstName}
              placeholder={firstNamePlaceholder}
              fullWidth
              disabled={disabled}
              ignorePasswordManagers
              onChange={handleSubFieldChange('firstName')}
              onFocus={() => setFocusedInputIndex(1)}
            />
            <TextInput
              ref={lastNameInputRef}
              label={t`Last name`}
              value={fullName.lastName}
              placeholder={lastNamePlaceholder}
              fullWidth
              disabled={disabled}
              ignorePasswordManagers
              onChange={handleSubFieldChange('lastName')}
              onFocus={() => setFocusedInputIndex(2)}
            />
          </StyledFullNameDetailsContainer>
        </>
      )}
    </FullNameContainer>
  );
};
