import { JsonArrayNode } from '@/workflow/components/json-visualizer/components/JsonArrayNode';
import { JsonObjectNode } from '@/workflow/components/json-visualizer/components/JsonObjectNode';
import { JsonValueNode } from '@/workflow/components/json-visualizer/components/JsonValueNode';
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
  if (value === null) {
    return <JsonValueNode label={label} valueAsString="[null]" />;
  }

  if (Array.isArray(value)) {
    return <JsonArrayNode label={label} value={value} depth={depth} />;
  }

  if (typeof value === 'string') {
    return <JsonValueNode label={label} valueAsString={value} />;
  }

  if (typeof value === 'number') {
    return <JsonValueNode label={label} valueAsString={String(value)} />;
  }

  if (typeof value === 'boolean') {
    return (
      <JsonValueNode label={label} valueAsString={value ? 'true' : 'false'} />
    );
  }

  return <JsonObjectNode label={label} value={value} depth={depth} />;
};
