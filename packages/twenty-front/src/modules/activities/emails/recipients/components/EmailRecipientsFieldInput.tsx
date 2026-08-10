import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import {
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useDebouncedCallback } from 'use-debounce';

import { EMAIL_RECIPIENT_DND_TYPE } from '@/activities/emails/recipients/constants/EmailRecipientDndType';
import {
  type EmailRecipientChipDropEdge,
  EmailRecipientsFieldChipCell,
} from '@/activities/emails/recipients/components/EmailRecipientsFieldChipCell';
import { EmailRecipientSuggestionsDropdownContent } from '@/activities/emails/recipients/components/EmailRecipientSuggestionsDropdownContent';
import { useEmailRecipientsField } from '@/activities/emails/recipients/hooks/useEmailRecipientsField';
import { useEmailRecipientsResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import {
  type EmailRecipientSuggestion,
  useEmailRecipientSuggestions,
} from '@/activities/emails/recipients/hooks/useEmailRecipientSuggestions';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { type EmailRecipientsFieldId } from '@/activities/emails/recipients/types/EmailRecipientsFieldId';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/ui/input/constants/FormFieldPlaceholderStyles';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { DND_KIT_COLLISION_PRIORITY } from '@/ui/utilities/drag-and-drop/constants/DndKitCollisionPriority';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const SUGGESTIONS_SEARCH_DEBOUNCE_MS = 300;

const StyledRowContainer = styled.div<{ $isDropTarget: boolean }>`
  align-content: flex-start;
  align-items: center;
  background-color: ${({ $isDropTarget }) =>
    $isDropTarget
      ? themeCssVariables.background.transparent.blue
      : themeCssVariables.background.transparent.lighter};
  border: 1px solid
    ${({ $isDropTarget }) =>
      $isDropTarget
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
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
  transition:
    background-color 120ms ease-out,
    border-color 120ms ease-out;
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
  fieldId: EmailRecipientsFieldId;
  // Indices being dragged out of this field, or null when the drag started
  // elsewhere.
  draggedSourceIndices: number[] | null;
  label: string;
  placeholder: string;
  recipients: EmailRecipient[];
  onChange: (recipients: EmailRecipient[]) => void;
  onSubmit?: () => void;
  excludedSuggestionKeys?: string[];
  contextRecord?: EmailComposerContextRecord | null;
};

export const EmailRecipientsFieldInput = ({
  fieldId,
  draggedSourceIndices,
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
    selectedChipIndices,
    selectionFocusIndex,
    chipFlash,
    commitInput,
    addRecipient,
    addRecipients,
    beginEditingChip,
    cancelEditing,
    removeRecipientAtIndex,
    removeSelectedRecipients,
    clearChipSelection,
    extendChipSelectionToIndex,
    toggleChipSelectionAtIndex,
    moveChipSelection,
    extendChipSelection,
  } = useEmailRecipientsField({ recipients, onChange });

  const { activeDropTargetIndex, activeDroppableId } = useContext(
    DragDropItemDndContext,
  );

  const isActiveDropField = activeDroppableId === fieldId;

  const { ref: droppableRef } = useDroppable({
    id: `${focusId}-droppable`,
    accept: EMAIL_RECIPIENT_DND_TYPE,
    collisionDetector: pointerIntersection,
    collisionPriority: DND_KIT_COLLISION_PRIORITY,
    data: { droppableId: fieldId, index: recipients.length },
  });

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

  const selectedChipIndexSet = useMemo(
    () => new Set(selectedChipIndices),
    [selectedChipIndices],
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

  // Gaps at either end of the dragged run put the chips back exactly where they
  // came from, so marking them would promise a reorder that cannot happen.
  const isNoOpDropGap = (gapIndex: number) => {
    if (draggedSourceIndices === null || draggedSourceIndices.length === 0) {
      return false;
    }

    const lowestIndex = Math.min(...draggedSourceIndices);
    const highestIndex = Math.max(...draggedSourceIndices);
    const isContiguousRun =
      highestIndex - lowestIndex + 1 === draggedSourceIndices.length;

    return (
      isContiguousRun && gapIndex >= lowestIndex && gapIndex <= highestIndex + 1
    );
  };

  const getChipDropEdge = (chipIndex: number): EmailRecipientChipDropEdge => {
    if (
      !isActiveDropField ||
      activeDropTargetIndex === null ||
      isNoOpDropGap(activeDropTargetIndex)
    ) {
      return null;
    }

    if (activeDropTargetIndex === chipIndex) {
      return 'before';
    }

    // Only the trailing chip owns the gap past the end of the row.
    return chipIndex === recipients.length - 1 &&
      activeDropTargetIndex === recipients.length
      ? 'after'
      : null;
  };

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

  const handleChipExtendSelectionTo = (chipIndex: number) => {
    extendChipSelectionToIndex(chipIndex);
    focusInput();
  };

  const handleChipToggleSelection = (chipIndex: number) => {
    toggleChipSelectionAtIndex(chipIndex);
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

        if (bufferIsEmpty && selectionFocusIndex !== null) {
          handleChipEdit(selectionFocusIndex);
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

        if (selectedChipIndices.length > 0) {
          removeSelectedRecipients();
          return;
        }

        scrollChipIntoView(moveChipSelection(-1));
        return;
      }
      case 'Delete': {
        if (bufferIsEmpty && selectedChipIndices.length > 0) {
          event.preventDefault();
          removeSelectedRecipients();
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
        scrollChipIntoView(
          event.shiftKey ? extendChipSelection(-1) : moveChipSelection(-1),
        );
        return;
      }
      case 'ArrowRight': {
        if (selectionFocusIndex === null) {
          return;
        }

        event.preventDefault();
        scrollChipIntoView(
          event.shiftKey ? extendChipSelection(1) : moveChipSelection(1),
        );
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

        if (selectedChipIndices.length > 0) {
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
      <EmailRecipientsFieldChipCell
        key={flashNonce === null ? chipKey : `${chipKey}-flash-${flashNonce}`}
        chipId={getChipId(chipIndex)}
        chipIndex={chipIndex}
        dropdownId={`${focusId}-chip-menu-${chipKey}`}
        dropEdge={getChipDropEdge(chipIndex)}
        fieldId={fieldId}
        isFlashing={flashNonce !== null}
        isInvalid={invalidRecipientKeys.has(chipKey)}
        isSelected={selectedChipIndexSet.has(chipIndex)}
        onEdit={() => handleChipEdit(chipIndex)}
        onExtendSelectionTo={() => handleChipExtendSelectionTo(chipIndex)}
        onRemove={() => handleChipRemove(chipIndex)}
        onToggleSelection={() => handleChipToggleSelection(chipIndex)}
        recipient={recipient}
        resolution={resolutionByRecipientKey.get(chipKey)}
        selectedIndices={selectedChipIndices}
        sortableId={`${fieldId}:${chipKey}`}
      />
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
          <StyledRowContainer
            ref={droppableRef}
            $isDropTarget={isActiveDropField}
            data-drop-target={isActiveDropField}
            onMouseDown={handleRowMouseDown}
          >
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
