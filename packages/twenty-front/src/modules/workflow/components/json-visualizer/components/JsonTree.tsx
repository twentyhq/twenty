import { JsonNode } from '@/workflow/components/json-visualizer/components/JsonNode';
import { JsonValue } from 'type-fest';

export const JsonTree = ({ value }: { value: JsonValue }) => {
  if (typeof value === 'object' && value !== null) {
    return <JsonNode value={value} label="" />;
  }

  return <JsonNode value={value} />;
};
