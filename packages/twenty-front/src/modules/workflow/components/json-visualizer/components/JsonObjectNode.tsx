import { JsonNestedNode } from '@/workflow/components/json-visualizer/components/JsonNestedNode';
import { useLingui } from '@lingui/react/macro';
import { IconCube } from 'twenty-ui';
import { JsonObject } from 'type-fest';

export const JsonObjectNode = ({
  label,
  value,
  depth,
  keyPath,
  getNodeHighlighting,
}: {
  label?: string;
  value: JsonObject;
  depth: number;
  keyPath: string;
  getNodeHighlighting?: (keyPath: string) => boolean;
}) => {
  const { t } = useLingui();

  return (
    <JsonNestedNode
      elements={Object.entries(value).map(([key, value]) => ({
        id: key,
        label: key,
        value,
      }))}
      renderElementsCount={(count) => `{${count}}`}
      label={label}
      Icon={IconCube}
      depth={depth}
      emptyElementsText={t`Empty Object`}
      keyPath={keyPath}
      getNodeHighlighting={getNodeHighlighting}
    />
  );
};
