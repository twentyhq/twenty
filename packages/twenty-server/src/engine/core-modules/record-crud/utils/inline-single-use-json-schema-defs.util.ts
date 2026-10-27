import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

type JsonSchemaNode = Record<string, unknown>;

type DefsRewrite = {
  defs: JsonSchemaNode;
  inlinableNames: Set<string>;
  renamedNames: Map<string, string>;
};

const DEFS_REF_PREFIX = '#/$defs/';

const getDefName = (ref: unknown): string | undefined =>
  isString(ref) && ref.startsWith(DEFS_REF_PREFIX)
    ? ref.slice(DEFS_REF_PREFIX.length)
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

  const defName = getDefName(value['$ref']);

  if (isDefined(defName)) {
    counts.set(defName, (counts.get(defName) ?? 0) + 1);
  }

  Object.values(value).forEach((child) =>
    countDefReferences({ value: child, counts }),
  );
};

const rewriteValue = ({
  value,
  rewrite,
}: {
  value: unknown;
  rewrite: DefsRewrite;
}): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteValue({ value: item, rewrite }));
  }

  return isPlainObject(value) ? rewriteNode({ node: value, rewrite }) : value;
};

const rewriteNode = ({
  node,
  rewrite,
}: {
  node: JsonSchemaNode;
  rewrite: DefsRewrite;
}): JsonSchemaNode => {
  const { $ref: ref, ...siblings } = node;
  const defName = getDefName(ref);

  if (!isDefined(defName)) {
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [
        key,
        rewriteValue({ value, rewrite }),
      ]),
    );
  }

  const rewrittenSiblings = rewriteNode({ node: siblings, rewrite });
  const def = rewrite.defs[defName];

  if (rewrite.inlinableNames.has(defName) && isPlainObject(def)) {
    return { ...rewriteNode({ node: def, rewrite }), ...rewrittenSiblings };
  }

  return {
    $ref: `${DEFS_REF_PREFIX}${rewrite.renamedNames.get(defName) ?? defName}`,
    ...rewrittenSiblings,
  };
};

// TODO: remove once zod stops hoisting the inner schema of `.optional().describe()` into $defs (seen in 4.6)
export const inlineSingleUseJsonSchemaDefs = (
  schema: JsonSchemaNode,
): JsonSchemaNode => {
  const { $defs: defs, ...rest } = schema;

  if (!isPlainObject(defs)) {
    return schema;
  }

  const counts = new Map<string, number>();

  countDefReferences({ value: schema, counts });

  const inlinableNames = new Set(
    Object.keys(defs).filter((name) => counts.get(name) === 1),
  );

  const remainingNames = Object.keys(defs).filter(
    (name) => !inlinableNames.has(name),
  );

  const rewrite: DefsRewrite = {
    defs,
    inlinableNames,
    renamedNames: new Map(
      remainingNames.map((name, index) => [name, `__schema${index}`]),
    ),
  };

  const inlined = rewriteNode({ node: rest, rewrite });

  if (remainingNames.length === 0) {
    return inlined;
  }

  return {
    ...inlined,
    $defs: Object.fromEntries(
      remainingNames.map((name) => [
        rewrite.renamedNames.get(name),
        rewriteValue({ value: defs[name], rewrite }),
      ]),
    ),
  };
};
