import { readFileSync } from 'fs';
import { resolve } from 'path';

import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'no-feature-imports-in-ui';

const UI_PATH_SEGMENT = '/src/modules/ui/';

const EXEMPT_FILE_MARKERS = [
  '.test.',
  '.spec.',
  '.stories.',
  '/__tests__/',
  '/__mocks__/',
  '/__stories__/',
];

// Keep in sync with packages/twenty-front/scripts/ui-boundary-baseline.mjs.
const isBannedImport = (importSource: string): boolean => {
  if (importSource.startsWith('@/')) {
    if (importSource.includes('/../') || importSource.endsWith('/..')) {
      return true;
    }

    return importSource !== '@/ui' && !importSource.startsWith('@/ui/');
  }

  if (
    importSource === '@apollo/client' ||
    importSource.startsWith('@apollo/client/')
  ) {
    return true;
  }

  if (importSource.startsWith('~/generated')) {
    return true;
  }

  return false;
};

const getStaticImportSource = (sourceNode: any): string | null => {
  if (sourceNode?.type === 'Literal' && typeof sourceNode.value === 'string') {
    return sourceNode.value;
  }

  if (
    sourceNode?.type === 'TemplateLiteral' &&
    sourceNode.expressions?.length === 0 &&
    sourceNode.quasis?.length === 1
  ) {
    return sourceNode.quasis[0]?.value?.cooked ?? null;
  }

  return null;
};

const toBaselineKey = (filename: string): string | null => {
  const index = filename.indexOf(UI_PATH_SEGMENT);

  if (index === -1) {
    return null;
  }

  return filename.slice(index + 1);
};

type Baseline = Record<string, string[]>;

const baselineCache = new Map<string, Baseline>();

const loadBaseline = (baselinePath: string): Baseline => {
  const resolvedPath = resolve(process.cwd(), baselinePath);
  const cached = baselineCache.get(resolvedPath);

  if (cached !== undefined) {
    return cached;
  }

  let baseline: Baseline = {};

  try {
    const parsed = JSON.parse(readFileSync(resolvedPath, 'utf8')) as {
      entries?: Baseline;
    };

    baseline = parsed.entries ?? {};
  } catch {
    baseline = {};
  }

  baselineCache.set(resolvedPath, baseline);

  return baseline;
};

const checkImport = (
  node: any,
  context: any,
  baseline: Baseline,
  baselineKey: string | null,
) => {
  const sourceNode = node.source;
  const importSource = getStaticImportSource(sourceNode);

  if (importSource === null) {
    return;
  }

  if (!isBannedImport(importSource)) {
    return;
  }

  if (
    baselineKey !== null &&
    (baseline[baselineKey] ?? []).includes(importSource)
  ) {
    return;
  }

  context.report({
    node: sourceNode,
    messageId: 'featureImportInUi',
    data: { importSource },
  });
};

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'src/modules/ui is the presentation layer: it must not import feature modules, Apollo, or generated GraphQL. Declare a context/hook interface inside the ui module and inject the implementation from the feature.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          baselinePath: { type: 'string' },
        },
      },
    ],
    messages: {
      featureImportInUi:
        "ui module imports '{{ importSource }}': src/modules/ui must not depend on feature modules. Invert the dependency (declare a context/hook interface in the ui module; inject the implementation from the feature). The pre-existing debt baseline (.ui-boundary-baseline.json) only shrinks.",
    },
  },
  create: (context) => {
    const filename: string = (context.filename ?? '').replace(/\\/g, '/');

    if (!filename.includes(UI_PATH_SEGMENT)) {
      return {};
    }

    if (EXEMPT_FILE_MARKERS.some((marker) => filename.includes(marker))) {
      return {};
    }

    const options = (context.options as [{ baselinePath?: string }])?.[0];
    const baseline =
      options?.baselinePath === undefined
        ? {}
        : loadBaseline(options.baselinePath);
    const baselineKey = toBaselineKey(filename);

    return {
      ImportDeclaration: (node: any) => {
        checkImport(node, context, baseline, baselineKey);
      },
      ImportExpression: (node: any) => {
        checkImport(node, context, baseline, baselineKey);
      },
      ExportNamedDeclaration: (node: any) => {
        if (node.source) {
          checkImport(node, context, baseline, baselineKey);
        }
      },
      ExportAllDeclaration: (node: any) => {
        checkImport(node, context, baseline, baselineKey);
      },
    };
  },
});
