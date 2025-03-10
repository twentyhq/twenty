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
  keyPath,
  getNodeHighlighting,
}: {
  label?: string;
  value: JsonValue;
  depth: number;
  keyPath: string;
  getNodeHighlighting?: (keyPath: string) => boolean;
}) => {
  const isHighlighted = getNodeHighlighting?.(keyPath) ?? false;

  console.log({ isHighlighted });

  if (isNull(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString="[null]"
        Icon={IconCircleOff}
        isHighlighted={isHighlighted}
      />
    );
  }

  if (isString(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString={value}
        Icon={IconTypography}
        isHighlighted={isHighlighted}
      />
    );
  }

  if (isNumber(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString={String(value)}
        Icon={IconNumber9}
        isHighlighted={isHighlighted}
      />
    );
  }

  if (isBoolean(value)) {
    return (
      <JsonValueNode
        label={label}
        valueAsString={String(value)}
        Icon={IconCheckbox}
        isHighlighted={isHighlighted}
      />
    );
  }

  if (isArray(value)) {
    return (
      <JsonArrayNode
        label={label}
        value={value}
        depth={depth}
        keyPath={keyPath}
        getNodeHighlighting={getNodeHighlighting}
      />
    );
  }

  return (
    <JsonObjectNode
      label={label}
      value={value}
      depth={depth}
      keyPath={keyPath}
      getNodeHighlighting={getNodeHighlighting}
    />
  );
};
