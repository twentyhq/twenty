import { isNonEmptyString } from '@sniptt/guards';

import { useAddressFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useAddressFieldDisplay';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';
import styled from '@emotion/styled';

const StyledTextDisplay = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
`;

export const AddressFieldDisplay = () => {
  const { fieldValue } = useAddressFieldDisplay();

  const content = [
    fieldValue?.addressStreet1,
    fieldValue?.addressStreet2,
    fieldValue?.addressCity,
    fieldValue?.addressCountry,
  ]
    .filter(isNonEmptyString)
    .join(', ');

  return (
    <StyledTextDisplay>
      <TextDisplay text={content} />
    </StyledTextDisplay>
  );
};
