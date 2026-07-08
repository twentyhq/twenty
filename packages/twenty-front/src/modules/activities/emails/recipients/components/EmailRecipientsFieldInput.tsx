import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useId,
  useRef,
} from 'react';
import { flushSync } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';

import { EmailRecipientChip } from '@/activities/emails/recipients/components/EmailRecipientChip';
import { useEmailRecipientsField } from '@/activities/emails/recipients/hooks/useEmailRecipientsField';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/object-record/record-field/ui/form-types/constants/FormFieldPlaceholderStyles';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRowContainer = styled.div`
  align-content: flex-start;
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  cursor: text;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  max-height: 96px;
  min-height: 32px;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  flex: 1 1 60px;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  height: 20px;
  min-width: 60px;
  outline: none;
  padding: 0;

  &::placeholder {
    ${FORM_FIELD_PLACEHOLDER_STYLES}
  }
`;

type EmailRecipientsFieldInputProps = {
  label: string;
  placeholder: string;
  recipients: EmailRecipient[];
  onChange: (recipients: EmailRecipient[]) => void;
};

export const EmailRecipientsFieldInput = ({
  label,
  placeholder,
  recipients,
  onChange,
}: EmailRecipientsFieldInputProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const focusId = `email-recipients-field-${instanceId}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const chipElementsByIndex = useRef(new Map<number, HTMLElement>());

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const {
    inputValue,
    setInputValue,
    editingIndex,
    isEditing,
    selectedChipIndex,
    chipFlash,
    clearChipFlash,
    commitInput,
    addRecipients,
    beginEditingChip,
    cancelEditing,
    removeRecipientAtIndex,
    removeRecipientWithKeyboard,
    clearChipSelection,
    moveChipSelection,
    getChipKey,
  } = useEmailRecipientsField({ recipients, onChange });

  const getChipId = (chipIndex: number) => `${focusId}-chip-${chipIndex}`;

  const scrollChipIntoView = (chipIndex: number | null) => {
    if (chipIndex === null) {
      return;
    }

    chipElementsByIndex.current
      .get(chipIndex)
      ?.scrollIntoView({ block: 'nearest' });
  };

  const focusInput = () => inputRef.current?.focus();

  const handleRowMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      event.preventDefault();
      focusInput();
    }
  };

  const handleInputFocus = () => {
    pushFocusItemToFocusStack({
      focusId,
      component: {
        type: FocusComponentType.FORM_FIELD_INPUT,
        instanceId: focusId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleInputBlur = () => {
    removeFocusItemFromFocusStackById({ focusId });
    commitInput();
    clearChipSelection();
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    clearChipSelection();
  };

  const handleInputPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (isEditing) {
      return;
    }

    const pastedText = event.clipboardData.getData('text/plain');
    const parsedRecipients = parseEmailRecipients(pastedText);

    const shouldCommitAsChips =
      parsedRecipients.length > 1 ||
      (parsedRecipients.length === 1 &&
        (isNonEmptyString(parsedRecipients[0].displayName) ||
          isValidEmailRecipientAddress(parsedRecipients[0].address)));

    if (!shouldCommitAsChips) {
      return;
    }

    event.preventDefault();
    addRecipients(parsedRecipients, null);
  };

  const handleChipDoubleClick = (chipIndex: number) => {
    flushSync(() => {
      beginEditingChip(chipIndex);
    });

    const inputElement = inputRef.current;

    if (!isDefined(inputElement)) {
      return;
    }

    inputElement.focus();
    inputElement.setSelectionRange(
      inputElement.value.length,
      inputElement.value.length,
    );
  };

  const handleChipRemove = (event: MouseEvent, chipIndex: number) => {
    event.stopPropagation();
    removeRecipientAtIndex(chipIndex);
    focusInput();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    const inputElement = event.currentTarget;
    const bufferIsEmpty = inputValue.length === 0;
    const caretAtStart =
      inputElement.selectionStart === 0 && inputElement.selectionEnd === 0;

    switch (event.key) {
      case 'Enter': {
        event.preventDefault();

        if (bufferIsEmpty && selectedChipIndex !== null) {
          beginEditingChip(selectedChipIndex);
          return;
        }

        commitInput();
        return;
      }
      case 'Tab': {
        if (!bufferIsEmpty) {
          commitInput();
        }
        return;
      }
      case ',':
      case ';': {
        event.preventDefault();

        if (!bufferIsEmpty) {
          commitInput();
        }
        return;
      }
      case ' ': {
        if (isValidEmailRecipientAddress(inputValue.trim())) {
          event.preventDefault();
          commitInput();
        }
        return;
      }
      case 'Backspace': {
        if (!bufferIsEmpty || isEditing) {
          return;
        }

        event.preventDefault();

        if (selectedChipIndex !== null) {
          removeRecipientWithKeyboard();
          return;
        }

        scrollChipIntoView(moveChipSelection(-1));
        return;
      }
      case 'Delete': {
        if (bufferIsEmpty && selectedChipIndex !== null) {
          event.preventDefault();
          removeRecipientWithKeyboard();
        }
        return;
      }
      case 'ArrowLeft': {
        if (!caretAtStart || isEditing || recipients.length === 0) {
          return;
        }

        event.preventDefault();
        scrollChipIntoView(moveChipSelection(-1));
        return;
      }
      case 'ArrowRight': {
        if (selectedChipIndex === null) {
          return;
        }

        event.preventDefault();
        scrollChipIntoView(moveChipSelection(1));
        return;
      }
      case 'Escape': {
        if (isEditing) {
          event.preventDefault();
          cancelEditing();
          return;
        }

        if (selectedChipIndex !== null) {
          event.preventDefault();
          clearChipSelection();
        }
        return;
      }
      default:
        return;
    }
  };

  const recipientsInput = (
    <StyledInput
      key="email-recipients-input"
      ref={inputRef}
      type="text"
      autoComplete="off"
      spellCheck={false}
      aria-label={label}
      aria-activedescendant={
        selectedChipIndex === null ? undefined : getChipId(selectedChipIndex)
      }
      placeholder={
        recipients.length === 0 && !isEditing ? placeholder : undefined
      }
      value={inputValue}
      onChange={(event) => handleInputChange(event.target.value)}
      onKeyDown={handleInputKeyDown}
      onPaste={handleInputPaste}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
    />
  );

  const rowChildren: ReactNode[] = recipients.map((recipient, chipIndex) => {
    if (chipIndex === editingIndex) {
      return recipientsInput;
    }

    const chipKey = getChipKey(recipient);
    const flashNonce =
      chipFlash !== null && chipFlash.chipKey === chipKey
        ? chipFlash.nonce
        : null;
    const isInvalid = !isValidEmailRecipientAddress(recipient.address);

    return (
      <div
        key={flashNonce === null ? chipKey : `${chipKey}-flash-${flashNonce}`}
        ref={(element) => {
          if (element === null) {
            chipElementsByIndex.current.delete(chipIndex);
          } else {
            chipElementsByIndex.current.set(chipIndex, element);
          }
        }}
        onMouseDown={(event) => event.preventDefault()}
      >
        <EmailRecipientChip
          chipId={getChipId(chipIndex)}
          label={recipient.displayName ?? recipient.address}
          title={
            isInvalid ? t`Invalid email address` : formatEmailRecipient(recipient)
          }
          danger={isInvalid}
          selected={chipIndex === selectedChipIndex}
          isFlashing={flashNonce !== null}
          onFlashEnd={clearChipFlash}
          onDoubleClick={() => handleChipDoubleClick(chipIndex)}
          onRemove={(event) => handleChipRemove(event, chipIndex)}
          removeAriaLabel={t`Remove recipient`}
        />
      </div>
    );
  });

  if (!isEditing) {
    rowChildren.push(recipientsInput);
  }

  return (
    <FormFieldInputContainer>
      <InputLabel>{label}</InputLabel>
      <StyledRowContainer
        role="listbox"
        aria-label={label}
        onMouseDown={handleRowMouseDown}
      >
        {rowChildren}
      </StyledRowContainer>
    </FormFieldInputContainer>
  );
};
