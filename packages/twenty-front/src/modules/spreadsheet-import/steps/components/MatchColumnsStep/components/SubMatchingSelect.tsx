import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SelectOption } from '@/spreadsheet-import/types';

import { getFieldOptions } from '@/spreadsheet-import/utils/getFieldOptions';

import { SelectFieldHotkeyScope } from '@/object-record/select/types/SelectFieldHotkeyScope';
import { SelectInput } from '@/ui/input/components/SelectInput';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useEffect, useState } from 'react';
import { IconChevronDown, Tag, TagColor } from 'twenty-ui';
import {
  MatchedOptions,
  MatchedSelectColumn,
  MatchedSelectOptionsColumn,
} from '../MatchColumnsStep';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledControlContainer = styled.div<{ cursor: string }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: ${({ cursor }) => cursor};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledControlLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconChevronDown = styled(IconChevronDown)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

interface SubMatchingSelectProps<T> {
  option: MatchedOptions<T> | Partial<MatchedOptions<T>>;
  column: MatchedSelectColumn<T> | MatchedSelectOptionsColumn<T>;
  onSubChange: (val: T, index: number, option: string) => void;
  placeholder: string;
  selectedOption?: MatchedOptions<T> | Partial<MatchedOptions<T>>;
}

export const SubMatchingSelect = <T extends string>({
  option,
  column,
  onSubChange,
  placeholder,
}: SubMatchingSelectProps<T>) => {
  const { fields } = useSpreadsheetImportInternal<T>();
  const options = getFieldOptions(fields, column.value) as SelectOption[];
  const value = options.find((opt) => opt.value === option.value);
  const [isOpen, setIsOpen] = useState(false);

  const theme = useTheme();

  const handleSelect = (selectedOption: SelectOption) => {
    onSubChange(selectedOption.value as T, column.index, option.entry ?? '');
    setIsOpen(false);
  };

  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(SelectFieldHotkeyScope.SelectField);
  }, [setHotkeyScope]);

  return (
    <StyledContainer>
      <StyledControlContainer cursor="default">
        <StyledControlLabel>
          <StyledLabel>{option.entry}</StyledLabel>
        </StyledControlLabel>
        <StyledIconChevronDown
          size={theme.font.size.md}
          color={theme.font.color.tertiary}
        />
      </StyledControlContainer>
      <StyledControlContainer
        cursor="pointer"
        onClick={() => setIsOpen(!isOpen)}
        id="control"
      >
        <Tag
          text={value?.label ?? placeholder}
          color={value?.color as TagColor}
        />
        <StyledIconChevronDown size={theme.icon.size.md} />
        {isOpen && (
          <SelectInput
            defaultOption={value}
            options={options}
            onOptionSelected={handleSelect}
            onCancel={() => setIsOpen(false)}
            hotkeyScope={SelectFieldHotkeyScope.SelectField}
          />
        )}
      </StyledControlContainer>
    </StyledContainer>
  );
};
