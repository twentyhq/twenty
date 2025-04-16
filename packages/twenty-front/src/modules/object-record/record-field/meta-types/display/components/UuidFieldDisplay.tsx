import { useUuidField } from '@/object-record/record-field/meta-types/hooks/useUuidField';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';
import styled from '@emotion/styled';

const StyledTextDisplay = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
`;

export const UuidFieldDisplay = () => {
  const { fieldValue } = useUuidField();

  return (
    <StyledTextDisplay>
      <TextDisplay text={fieldValue} />
    </StyledTextDisplay>
  );
};
