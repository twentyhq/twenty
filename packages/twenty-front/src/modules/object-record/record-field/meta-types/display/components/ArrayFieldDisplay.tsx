import { THEME_COMMON } from 'twenty-ui';

import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useArrayFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useArrayFieldDisplay';
import { ArrayDisplay } from '@/ui/field/display/components/ArrayDisplay';
import styled from '@emotion/styled';

const spacing1 = THEME_COMMON.spacing(1);

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing1};
  justify-content: flex-start;
  max-width: 100%;
  overflow: hidden;
`;

export const ArrayFieldDisplay = () => {
  const { fieldValue } = useArrayFieldDisplay();

  const { isFocused } = useFieldFocus();

  if (!Array.isArray(fieldValue)) {
    return <></>;
  }

  return (
    <StyledContainer>
      <ArrayDisplay value={fieldValue} isFocused={isFocused} />
    </StyledContainer>
  );
};
