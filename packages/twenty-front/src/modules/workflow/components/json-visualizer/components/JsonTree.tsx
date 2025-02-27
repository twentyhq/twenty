import { JsonList } from '@/workflow/components/json-visualizer/components/internal/JsonList';
import { JsonNode } from '@/workflow/components/json-visualizer/components/JsonNode';
import { JsonValue } from 'type-fest';

export const JsonTree = ({ value }: { value: JsonValue }) => {
  return (
    <JsonList className="json-tree" depth={0}>
      <JsonNode value={value} depth={0} />
    </JsonList>
  );
};
