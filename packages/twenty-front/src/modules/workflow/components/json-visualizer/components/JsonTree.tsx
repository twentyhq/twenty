import { JsonList } from '@/workflow/components/json-visualizer/components/internal/JsonList';
import { JsonNode } from '@/workflow/components/json-visualizer/components/JsonNode';
import { JsonValue } from 'type-fest';

export const JsonTree = ({
  value,
  getNodeHighlighting,
}: {
  value: JsonValue;
  getNodeHighlighting?: (keyPath: string) => boolean;
}) => {
  return (
    <JsonList depth={0}>
      <JsonNode
        value={value}
        depth={0}
        keyPath=""
        getNodeHighlighting={getNodeHighlighting}
      />
    </JsonList>
  );
};
