import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { flip, offset, useFloating } from '@floating-ui/react';

import { DateDisplay } from '@/ui/field/meta-types/display/content-display/components/DateDisplay';
import { InternalDatePicker } from '@/ui/input/components/internal/date/components/InternalDatePicker';
import { Nullable } from '~/types/Nullable';

import { useRegisterInputEvents } from '../../hooks/useRegisterInputEvents';

const StyledCalendarContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  margin-top: 1px;

  position: absolute;

  z-index: 1;
`;

const StyledInputContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(0)} ${({ theme }) => theme.spacing(2)};

  width: 100%;
`;

export type DateInputProps = {
  value: Nullable<Date>;
  onEnter: (newDate: Nullable<Date>) => void;
  onEscape: (newDate: Nullable<Date>) => void;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newDate: Nullable<Date>,
  ) => void;
  hotkeyScope: string;
};

export const DateInput = ({
  value,
  hotkeyScope,
  onEnter,
  onEscape,
  onClickOutside,
}: DateInputProps) => {
  const theme = useTheme();

  const [internalValue, setInternalValue] = useState(value);

  const wrapperRef = useRef(null);

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [
      flip(),
      offset({
        mainAxis: theme.spacingMultiplicator * 2,
      }),
    ],
  });

  const handleChange = (newDate: Date) => {
    setInternalValue(newDate);
  };

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useRegisterInputEvents({
    inputRef: wrapperRef,
    inputValue: internalValue,
    onEnter,
    onEscape,
    onClickOutside,
    hotkeyScope,
  });

  return (
    <div ref={wrapperRef}>
      <div ref={refs.setReference}>
        <StyledInputContainer>
          <DateDisplay value={internalValue ?? new Date()} />
        </StyledInputContainer>
      </div>
      <div ref={refs.setFloating} style={floatingStyles}>
        <StyledCalendarContainer>
          <InternalDatePicker
            date={internalValue ?? new Date()}
            onChange={handleChange}
            onMouseSelect={(newDate: Date) => {
              onEnter(newDate);
            }}
          />
        </StyledCalendarContainer>
      </div>
    </div>
  );
};
