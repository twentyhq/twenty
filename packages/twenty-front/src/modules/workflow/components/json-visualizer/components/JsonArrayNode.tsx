import { JsonNestedNode } from '@/workflow/components/json-visualizer/components/JsonNestedNode';
import { useLingui } from '@lingui/react/macro';
import { IconBrackets } from 'twenty-ui';
import { JsonArray } from 'type-fest';

export const JsonArrayNode = ({
  label,
  value,
  depth,
  keyPath,
  getNodeHighlighting,
}: {
  label?: string;
  value: JsonArray;
  depth: number;
  keyPath: string;
  getNodeHighlighting?: (keyPath: string) => boolean;
}) => {
  const { t } = useLingui();

  return (
    <JsonNestedNode
      elements={[...value.entries()].map(([key, value]) => ({
        id: key,
        label: String(key),
        value,
      }))}
      renderElementsCount={(count) => `[${count}]`}
      label={label}
      Icon={IconBrackets}
      depth={depth}
      emptyElementsText={t`Empty Array`}
      keyPath={keyPath}
      getNodeHighlighting={getNodeHighlighting}
    />
  );
};
