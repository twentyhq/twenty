import { JsonListItem } from '@/workflow/components/json-visualizer/components/internal/JsonListItem';
import { JsonNodeLabel } from '@/workflow/components/json-visualizer/components/internal/JsonNodeLabel';
import { JsonNodeValue } from '@/workflow/components/json-visualizer/components/internal/JsonNodeValue';
import styled from '@emotion/styled';

const StyledListItem = styled(JsonListItem)`
  column-gap: ${({ theme }) => theme.spacing(2)};
`;

export const JsonValueNode = ({
  label,
  valueAsString,
}: {
  label?: string;
  valueAsString: string;
}) => {
  return (
    <StyledListItem>
      {label && <JsonNodeLabel label={label} />}

      <JsonNodeValue valueAsString={valueAsString} />
    </StyledListItem>
  );
};
