import { JsonValueNode } from '@/workflow/components/json-visualizer/components/JsonValueNode';
import { JsonValue } from 'type-fest';

export const JsonNode = ({
  label,
  value,
}: {
  label?: string;
  value: JsonValue;
}) => {
  if (value === null) {
    return <JsonValueNode label={label} valueAsString="[null]" />;
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (typeof value === 'string') {
    return <JsonValueNode label={label} valueAsString={value} />;
  }

  if (typeof value === 'number') {
    return <JsonValueNode label={label} valueAsString={String(value)} />;
  }

  if (typeof value === 'boolean') {
    <JsonValueNode label={label} valueAsString={value ? 'true' : 'false'} />;
  }

  return 'object';
};
