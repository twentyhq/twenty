import { useJsonFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useJsonFieldDisplay';
import { JsonDisplay } from '@/ui/field/display/components/JsonDisplay';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledJsonFieldDisplay = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
`;

export const JsonFieldDisplay = () => {
  const { fieldValue, maxWidth } = useJsonFieldDisplay();

  if (!isDefined(fieldValue)) {
    return <></>;
  }

  const value = JSON.stringify(fieldValue);

  return (
    <StyledJsonFieldDisplay>
      <JsonDisplay text={value} maxWidth={maxWidth} />
    </StyledJsonFieldDisplay>
  );
};
