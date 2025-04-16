import { useDateFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useDateFieldDisplay';
import { DateDisplay } from '@/ui/field/display/components/DateDisplay';
import styled from '@emotion/styled';

const StyledDateDisplay = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
`;

export const DateFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useDateFieldDisplay();

  const displayAsRelativeDate =
    fieldDefinition.metadata?.settings?.displayAsRelativeDate;

  return (
    <StyledDateDisplay>
      <DateDisplay
        value={fieldValue}
        displayAsRelativeDate={displayAsRelativeDate}
      />
    </StyledDateDisplay>
  );
};
