import { useEffect } from 'react';
import { useIMask } from 'react-imask';
import styled from '@emotion/styled';
import { IconClockHour8 } from 'twenty-ui';

import { TIME_BLOCKS } from '@/ui/input/components/internal/date/constants/TimeBlocks';
import { TIME_MASK } from '@/ui/input/components/internal/date/constants/TimeMask';

const StyledIconClock = styled(IconClockHour8)`
  position: absolute;
`;

const StyledTimeInputContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  margin-left: ${({ theme }) => theme.spacing(1)};
  margin-right: 0;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  position: absolute;
  text-align: left;
  width: 136px;
  height: 32px;
  gap: ${({ theme }) => theme.spacing(1)};
  top: 56px;
  z-index: 10;
`;

const StyledTimeInput = styled.input`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  outline: none;
  font-weight: 500;
  font-size: ${({ theme }) => theme.font.size.md};
  margin-left: ${({ theme }) => theme.spacing(5)};
`;

type TimeInputProps = {
  onChange?: (date: Date) => void;
  date: Date;
};

export const TimeInput = ({ date, onChange }: TimeInputProps) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const handleComplete = (value: string) => {
    const [hours, minutes] = value.split(':');

    const newDate = new Date(date);

    newDate.setHours(parseInt(hours, 10));
    newDate.setMinutes(parseInt(minutes, 10));

    onChange?.(newDate);
  };

  const { ref, setValue } = useIMask(
    {
      mask: TIME_MASK,
      blocks: TIME_BLOCKS,
    },
    {
      onComplete: handleComplete,
    },
  );

  useEffect(() => {
    setValue(`${hours}:${minutes}`);
  }, [hours, minutes, setValue]);

  return (
    <StyledTimeInputContainer>
      <StyledIconClock size={16} />
      <StyledTimeInput type="text" ref={ref as any} />
    </StyledTimeInputContainer>
  );
};
