import { useDateFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useDateFieldDisplay';
import { DateDisplay } from '@/ui/field/display/components/DateDisplay';
import styled from '@emotion/styled';

const StyledDateDisplayContainer = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
`;

export const DateFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useDateFieldDisplay();

  const displayAsRelativeDate =
    fieldDefinition.metadata?.settings?.displayAsRelativeDate;

  return (
    <StyledDateDisplayContainer>
      <DateDisplay
        value={fieldValue}
        displayAsRelativeDate={displayAsRelativeDate}
      />
    </StyledDateDisplayContainer>
  );
};
