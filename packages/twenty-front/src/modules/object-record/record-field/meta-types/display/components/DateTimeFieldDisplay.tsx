import { useDateTimeFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useDateTimeFieldDisplay';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';
import styled from '@emotion/styled';

const StyledDateTimeDisplayContainer = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
`;

export const DateTimeFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useDateTimeFieldDisplay();

  const displayAsRelativeDate =
    fieldDefinition.metadata?.settings?.displayAsRelativeDate;

  return (
    <StyledDateTimeDisplayContainer>
      <DateTimeDisplay
        value={fieldValue}
        displayAsRelativeDate={displayAsRelativeDate}
      />
    </StyledDateTimeDisplayContainer>
  );
};
