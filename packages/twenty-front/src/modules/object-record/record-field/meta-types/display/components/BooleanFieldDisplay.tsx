import { useBooleanFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useBooleanFieldDisplay';
import { BooleanDisplay } from '@/ui/field/display/components/BooleanDisplay';
import styled from '@emotion/styled';

const StyledBooleanDisplay = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
`;
export const BooleanFieldDisplay = () => {
  const { fieldValue } = useBooleanFieldDisplay();

  return (
    <StyledBooleanDisplay>
      <BooleanDisplay value={fieldValue} />
    </StyledBooleanDisplay>
  );
};
