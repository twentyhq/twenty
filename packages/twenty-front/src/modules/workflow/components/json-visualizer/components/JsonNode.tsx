import { JsonArrayNode } from '@/workflow/components/json-visualizer/components/JsonArrayNode';
import { JsonObjectNode } from '@/workflow/components/json-visualizer/components/JsonObjectNode';
import { JsonValueNode } from '@/workflow/components/json-visualizer/components/JsonValueNode';
import { isArray } from '@/workflow/components/json-visualizer/utils/isArray';
import { isBoolean, isNull, isNumber, isString } from '@sniptt/guards';
import {
  IconCheckbox,
  IconCircleOff,
  IconNumber9,
  IconTypography,
} from 'twenty-ui';
import { JsonValue } from 'type-fest';

export const JsonNode = ({
  label,
  value,
  depth,
}: {
  label?: string;
  value: JsonValue;
  depth: number;
}) => {
  if (isNull(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString="[null]"
        Icon={IconCircleOff}
      />
    );
  }

  if (isString(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString={value}
        Icon={IconTypography}
      />
    );
  }

  if (isNumber(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString={String(value)}
        Icon={IconNumber9}
      />
    );
  }

  if (isBoolean(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString={String(value)}
        Icon={IconCheckbox}
      />
    );
  }

  if (isArray(value)) {
    return <JsonArrayNode label={label} value={value} depth={depth} />;
  }

  return <JsonObjectNode label={label} value={value} depth={depth} />;
};
