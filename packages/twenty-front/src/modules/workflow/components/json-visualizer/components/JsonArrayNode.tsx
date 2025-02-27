import { JsonNestedNode } from '@/workflow/components/json-visualizer/components/JsonNestedNode';
import { JsonArray } from 'type-fest';

export const JsonArrayNode = ({
  label,
  value,
  depth,
}: {
  label?: string;
  value: JsonArray;
  depth: number;
}) => {
  return (
    <JsonNestedNode
      elements={[...value.entries()].map(([key, value]) => ({
        key: String(key),
        value,
      }))}
      label={label}
      depth={depth}
    />
  );
};
