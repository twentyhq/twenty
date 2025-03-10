import { JsonNestedNode } from '@/workflow/components/json-visualizer/components/JsonNestedNode';
import { IconCube } from 'twenty-ui';
import { JsonObject } from 'type-fest';

export const JsonObjectNode = ({
  label,
  value,
  depth,
}: {
  label?: string;
  value: JsonObject;
  depth: number;
}) => {
  return (
    <JsonNestedNode
      elements={Object.entries(value).map(([key, value]) => ({
        id: key,
        label: key,
        value,
      }))}
      label={label}
      Icon={IconCube}
      depth={depth}
    />
  );
};
