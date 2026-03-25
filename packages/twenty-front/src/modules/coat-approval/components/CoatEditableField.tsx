import { COAT_OBJECT_NAME_SINGULAR } from '@/coat-approval/constants/CoatObjectNameSingular.constants';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import styled from '@emotion/styled';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type CoatEditableFieldType = 'text' | 'number' | 'date';

type CoatEditableFieldProps = {
  fieldName: string;
  value: string | number | null;
  objectId: string;
  type?: CoatEditableFieldType;
};

const StyledFieldContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  min-height: 20px;
  position: relative;
`;

const StyledDisplayValue = styled.span`
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: 2px 4px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
    border-color: ${({ theme }) => theme.border.color.light};
  }
`;

const StyledEmptyValue = styled.span`
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-style: italic;
  padding: 2px 4px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
    border-color: ${({ theme }) => theme.border.color.light};
  }
`;

const StyledInput = styled.input`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  outline: none;
  padding: 2px 4px;
  width: 100%;

  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.color.blue}40;
  }
`;

const StyledSaveIndicator = styled.span`
  color: ${({ theme }) => theme.color.green};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  opacity: 1;
  transition: opacity 0.3s ease;
`;

// Convert a date string (ISO or locale) to YYYY-MM-DD for the date input
const toDateInputValue = (value: string | number | null): string => {
  if (!isDefined(value) || typeof value !== 'string') {
    return '';
  }

  try {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const getInitialEditValue = (
  value: string | number | null,
  type: CoatEditableFieldType,
): string => {
  if (!isDefined(value)) {
    return '';
  }

  if (type === 'date') {
    return toDateInputValue(value);
  }

  return String(value);
};

export const CoatEditableField = ({
  fieldName,
  value,
  objectId,
  type = 'text',
}: CoatEditableFieldProps) => {
  const { updateOneRecord } = useUpdateOneRecord();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(() =>
    getInitialEditValue(value, type),
  );
  const [showSaved, setShowSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync editValue when the external value changes (e.g. after a refetch)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(getInitialEditValue(value, type));
    }
  }, [value, type, isEditing]);

  const handleStartEditing = useCallback(() => {
    setEditValue(getInitialEditValue(value, type));
    setIsEditing(true);
  }, [value, type]);

  // Focus the input when editing begins
  useEffect(() => {
    if (isEditing === true && isDefined(inputRef.current)) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(async () => {
    setIsEditing(false);

    const originalStringValue = getInitialEditValue(value, type);

    // If the value didn't change, skip the API call
    if (editValue === originalStringValue) {
      return;
    }

    let parsedValue: string | number | null;

    if (editValue.trim() === '') {
      parsedValue = null;
    } else if (type === 'number') {
      const num = parseFloat(editValue);
      parsedValue = isNaN(num) ? null : num;
    } else if (type === 'date') {
      // Send as ISO string
      parsedValue = editValue ? new Date(editValue).toISOString() : null;
    } else {
      parsedValue = editValue;
    }

    try {
      await updateOneRecord({
        objectNameSingular: COAT_OBJECT_NAME_SINGULAR,
        idToUpdate: objectId,
        updateOneRecordInput: {
          [fieldName]: parsedValue,
        },
      });

      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1500);
    } catch {
      // Revert on failure — restore the previous value
      setEditValue(originalStringValue);
    }
  }, [editValue, value, type, fieldName, objectId, updateOneRecord]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleSave();
      }

      if (event.key === 'Escape') {
        setEditValue(getInitialEditValue(value, type));
        setIsEditing(false);
      }
    },
    [handleSave, value, type],
  );

  if (isEditing) {
    return (
      <StyledFieldContainer>
        <StyledInput
          ref={inputRef}
          type={
            type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'
          }
          value={editValue}
          onChange={(event) => setEditValue(event.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          step={type === 'number' ? '0.01' : undefined}
        />
      </StyledFieldContainer>
    );
  }

  const isEmpty =
    !isDefined(value) ||
    (typeof value === 'string' && value.trim().length === 0);

  return (
    <StyledFieldContainer>
      {isEmpty ? (
        <StyledEmptyValue onClick={handleStartEditing}>
          Not available
        </StyledEmptyValue>
      ) : (
        <StyledDisplayValue onClick={handleStartEditing}>
          {type === 'date' ? formatDateDisplay(value) : String(value)}
        </StyledDisplayValue>
      )}
      {showSaved && <StyledSaveIndicator>Saved</StyledSaveIndicator>}
    </StyledFieldContainer>
  );
};

// Format a date for display in read mode (dd.mm.yyyy)
const formatDateDisplay = (value: string | number | null): string => {
  if (!isDefined(value) || typeof value !== 'string') {
    return 'Not available';
  }

  try {
    const date = new Date(value);

    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'Not available';
  }
};
