import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

type JsonSchemaNode = Record<string, unknown>;

const DEFS_REF_PREFIX = '#/$defs/';

const getDefName = (node: JsonSchemaNode): string | undefined =>
  isString(node.$ref) && node.$ref.startsWith(DEFS_REF_PREFIX)
    ? node.$ref.slice(DEFS_REF_PREFIX.length)
    : undefined;

const countDefReferences = ({
  value,
  counts,
}: {
  value: unknown;
  counts: Map<string, number>;
}): void => {
  if (Array.isArray(value)) {
    value.forEach((item) => countDefReferences({ value: item, counts }));

    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  const defName = getDefName(value);

  if (isDefined(defName)) {
    counts.set(defName, (counts.get(defName) ?? 0) + 1);
  }

  Object.values(value).forEach((child) =>
    countDefReferences({ value: child, counts }),
  );
};

// Since zod 4.4, reused: 'ref' also hoists the inner schema of a described wrapper
// (e.g. `.optional().describe()`) into $defs. Inline every def used once and renumber
// the shared ones, so the output matches what reused: 'ref' produced before.
export const inlineSingleUseJsonSchemaDefs = (
  schema: JsonSchemaNode,
): JsonSchemaNode => {
  const { $defs: defs, ...root } = schema;

  if (!isPlainObject(defs)) {
    return schema;
  }

  const counts = new Map<string, number>();

  countDefReferences({ value: schema, counts });

  const sharedDefNames = Object.keys(defs).filter(
    (name) => counts.get(name) !== 1 || !isPlainObject(defs[name]),
  );
  const renamedDefNames = new Map(
    sharedDefNames.map((name, index) => [name, `__schema${index}`]),
  );

  const rewrite = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(rewrite);
    }

    if (!isPlainObject(value)) {
      return value;
    }

    const defName = getDefName(value);
    const node = Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !isDefined(defName) || key !== '$ref')
        .map(([key, child]) => [key, rewrite(child)]),
    );

    if (!isDefined(defName)) {
      return node;
    }

    const renamedDefName = renamedDefNames.get(defName);

    if (isDefined(renamedDefName)) {
      return { $ref: `${DEFS_REF_PREFIX}${renamedDefName}`, ...node };
    }

    return { ...(rewrite(defs[defName]) as JsonSchemaNode), ...node };
  };

  const rewrittenRoot = rewrite(root) as JsonSchemaNode;

  if (sharedDefNames.length === 0) {
    return rewrittenRoot;
  }

  return {
    ...rewrittenRoot,
    $defs: Object.fromEntries(
      sharedDefNames.map((name) => [
        renamedDefNames.get(name),
        rewrite(defs[name]),
      ]),
    ),
  };
};
