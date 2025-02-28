import { JsonListItem } from '@/workflow/components/json-visualizer/components/internal/JsonListItem';
import { JsonNodeLabel } from '@/workflow/components/json-visualizer/components/internal/JsonNodeLabel';
import { JsonNodeValue } from '@/workflow/components/json-visualizer/components/internal/JsonNodeValue';
import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';

const StyledListItem = styled(JsonListItem)`
  column-gap: ${({ theme }) => theme.spacing(2)};
`;

type JsonValueNodeProps = {
  valueAsString: string;
} & (
  | {
      label: string;
      Icon: IconComponent;
    }
  | {
      label?: never;
      Icon?: any;
    }
);

export const JsonValueNode = (props: JsonValueNodeProps) => {
  return (
    <StyledListItem>
      {props.label && <JsonNodeLabel label={props.label} Icon={props.Icon} />}

      <JsonNodeValue valueAsString={props.valueAsString} />
    </StyledListItem>
  );
};
