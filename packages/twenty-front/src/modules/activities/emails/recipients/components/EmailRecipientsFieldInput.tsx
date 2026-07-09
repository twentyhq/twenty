import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import {
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useDebouncedCallback } from 'use-debounce';

import { EmailRecipientsFieldChip } from '@/activities/emails/recipients/components/EmailRecipientsFieldChip';
import { EmailRecipientSuggestionsDropdownContent } from '@/activities/emails/recipients/components/EmailRecipientSuggestionsDropdownContent';
import { useEmailRecipientsField } from '@/activities/emails/recipients/hooks/useEmailRecipientsField';
import { useEmailRecipientsResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import {
  type EmailRecipientSuggestion,
  useEmailRecipientSuggestions,
} from '@/activities/emails/recipients/hooks/useEmailRecipientSuggestions';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/object-record/record-field/ui/form-types/constants/FormFieldPlaceholderStyles';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const SUGGESTIONS_SEARCH_DEBOUNCE_MS = 300;

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
  onSubmit?: () => void;
  excludedSuggestionKeys?: string[];
  contextRecord?: EmailComposerContextRecord | null;
};

export const EmailRecipientsFieldInput = ({
  label,
  placeholder,
  recipients,
  onChange,
  onSubmit,
  excludedSuggestionKeys = [],
  contextRecord,
}: EmailRecipientsFieldInputProps) => {
  const instanceId = useId();
  const focusId = `email-recipients-field-${instanceId}`;
  const suggestionsDropdownId = `${focusId}-suggestions`;

  const inputRef = useRef<HTMLInputElement>(null);

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();
  const { resetSelectedItem } = useSelectableList(suggestionsDropdownId);

  const store = useStore();
  const selectedItemIdAtom = useAtomComponentStateCallbackState(
    selectedItemIdComponentState,
    suggestionsDropdownId,
  );

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    suggestionsDropdownId,
  );

  const {
    inputValue,
    setInputValue,
    editingIndex,
    isEditing,
    selectedChipIndex,
    chipFlash,
    commitInput,
    addRecipient,
    addRecipients,
    beginEditingChip,
    cancelEditing,
    removeRecipientAtIndex,
    removeRecipientWithKeyboard,
    clearChipSelection,
    moveChipSelection,
  } = useEmailRecipientsField({ recipients, onChange });

  const [suggestionsSearchInput, setSuggestionsSearchInput] = useState('');
  const debouncedSetSuggestionsSearchInput = useDebouncedCallback(
    setSuggestionsSearchInput,
    SUGGESTIONS_SEARCH_DEBOUNCE_MS,
  );

  const resetSuggestionsSearchInput = () => {
    debouncedSetSuggestionsSearchInput.cancel();
    setSuggestionsSearchInput('');
  };

  const { resolutionByRecipientKey } = useEmailRecipientsResolution({
    recipients,
  });

  const { suggestions } = useEmailRecipientSuggestions({
    searchInput: isEditing ? '' : suggestionsSearchInput,
    excludedRecipientKeys: excludedSuggestionKeys,
    contextRecord,
  });

  const invalidRecipientKeys = useMemo(
    () =>
      new Set(
        recipients
          .filter(
            (recipient) => !isValidEmailRecipientAddress(recipient.address),
          )
          .map((recipient) => getEmailRecipientKey(recipient.address)),
      ),
    [recipients],
  );

  const openSuggestions = () => {
    if (!isDropdownOpen) {
      openDropdown({
        dropdownComponentInstanceIdFromProps: suggestionsDropdownId,
        globalHotkeysConfig: { enableGlobalHotkeysWithModifiers: true },
      });
    }
  };

  const closeSuggestions = () => {
    if (isDropdownOpen) {
      closeDropdown(suggestionsDropdownId);
    }
  };

  const getChipId = (chipIndex: number) => `${focusId}-chip-${chipIndex}`;

  const scrollChipIntoView = (chipIndex: number | null) => {
    if (chipIndex === null) {
      return;
    }

    document
      .getElementById(getChipId(chipIndex))
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

  const handleInputClick = () => {
    if (!isEditing && inputValue.length === 0 && suggestions.length > 0) {
      openSuggestions();
    }
  };

  const commitInputAndCloseSuggestions = () => {
    commitInput();
    resetSuggestionsSearchInput();
    closeSuggestions();
  };

  const handleInputBlur = () => {
    removeFocusItemFromFocusStackById({ focusId });
    commitInputAndCloseSuggestions();
    clearChipSelection();
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    clearChipSelection();
    resetSelectedItem();

    if (isEditing) {
      return;
    }

    debouncedSetSuggestionsSearchInput(value);

    if (value.trim().length > 0) {
      openSuggestions();
    } else {
      resetSuggestionsSearchInput();
      closeSuggestions();
    }
  };

  const handlePickSuggestion = (suggestion: EmailRecipientSuggestion) => {
    addRecipient(suggestion.recipient);
    resetSuggestionsSearchInput();
    closeSuggestions();
    focusInput();
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

  const handleChipEdit = (chipIndex: number) => {
    flushSync(() => {
      beginEditingChip(chipIndex);
      resetSuggestionsSearchInput();
      closeSuggestions();
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

  const handleChipRemove = (chipIndex: number) => {
    removeRecipientAtIndex(chipIndex);
    focusInput();
  };

  const handleSubmitHotkey = () => {
    if (inputValue.length > 0) {
      commitInputAndCloseSuggestions();
    } else {
      onSubmit?.();
    }
  };

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: handleSubmitHotkey,
    focusId,
    dependencies: [handleSubmitHotkey],
  });

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: handleSubmitHotkey,
    focusId: suggestionsDropdownId,
    dependencies: [handleSubmitHotkey],
  });

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

        if (!isEditing && isDropdownOpen && suggestions.length > 0) {
          const selectedItemId = store.get(selectedItemIdAtom);
          const selectedSuggestion = suggestions.find(
            (suggestion) => suggestion.suggestionId === selectedItemId,
          );
          const suggestionsMatchBuffer =
            suggestionsSearchInput === inputValue.trim();
          const topSuggestion = suggestionsMatchBuffer
            ? suggestions[0]
            : undefined;
          const pickedSuggestion = selectedSuggestion ?? topSuggestion;

          if (isDefined(pickedSuggestion)) {
            handlePickSuggestion(pickedSuggestion);
            return;
          }
        }

        if (bufferIsEmpty && selectedChipIndex !== null) {
          handleChipEdit(selectedChipIndex);
          return;
        }

        commitInputAndCloseSuggestions();
        return;
      }
      case 'Tab': {
        if (!bufferIsEmpty) {
          commitInputAndCloseSuggestions();
        }
        return;
      }
      case ',':
      case ';': {
        event.preventDefault();

        if (!bufferIsEmpty) {
          commitInputAndCloseSuggestions();
        }
        return;
      }
      case ' ': {
        if (isValidEmailRecipientAddress(inputValue.trim())) {
          event.preventDefault();
          commitInputAndCloseSuggestions();
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
      case 'ArrowDown': {
        if (!isEditing && !isDropdownOpen && suggestions.length > 0) {
          event.preventDefault();
          openSuggestions();
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
        if (isDropdownOpen) {
          closeSuggestions();
          return;
        }

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
      role="combobox"
      aria-expanded={isDropdownOpen}
      aria-label={label}
      placeholder={
        recipients.length === 0 && !isEditing ? placeholder : undefined
      }
      value={inputValue}
      onChange={(event) => handleInputChange(event.target.value)}
      onKeyDown={handleInputKeyDown}
      onPaste={handleInputPaste}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
      onClick={handleInputClick}
    />
  );

  const rowChildren: ReactNode[] = recipients.map((recipient, chipIndex) => {
    if (chipIndex === editingIndex) {
      return recipientsInput;
    }

    const chipKey = getEmailRecipientKey(recipient.address);
    const flashNonce =
      chipFlash !== null && chipFlash.chipKey === chipKey
        ? chipFlash.nonce
        : null;

    return (
      <div
        key={flashNonce === null ? chipKey : `${chipKey}-flash-${flashNonce}`}
        onMouseDown={(event) => event.preventDefault()}
      >
        <EmailRecipientsFieldChip
          chipId={getChipId(chipIndex)}
          dropdownId={`${focusId}-chip-menu-${chipKey}`}
          recipient={recipient}
          resolution={resolutionByRecipientKey.get(chipKey)}
          isInvalid={invalidRecipientKeys.has(chipKey)}
          selected={chipIndex === selectedChipIndex}
          isFlashing={flashNonce !== null}
          onEdit={() => handleChipEdit(chipIndex)}
          onRemove={() => handleChipRemove(chipIndex)}
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
      <Dropdown
        dropdownId={suggestionsDropdownId}
        dropdownPlacement="bottom-start"
        dropdownOffset={{ y: 4 }}
        disableClickForClickableComponent
        clickableComponentWidth="100%"
        onClose={resetSelectedItem}
        clickableComponent={
          <StyledRowContainer onMouseDown={handleRowMouseDown}>
            {rowChildren}
          </StyledRowContainer>
        }
        dropdownComponents={
          <EmailRecipientSuggestionsDropdownContent
            suggestions={suggestions}
            selectableListInstanceId={suggestionsDropdownId}
            focusId={suggestionsDropdownId}
            onPick={handlePickSuggestion}
          />
        }
      />
    </FormFieldInputContainer>
  );
};
