import { JsonNodeLabel } from '@/workflow/components/json-visualizer/components/internal/JsonNodeLabel';
import { JsonNodeValue } from '@/workflow/components/json-visualizer/components/internal/JsonNodeValue';
import styled from '@emotion/styled';

const StyledListItem = styled.li`
  list-style-type: none;
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
