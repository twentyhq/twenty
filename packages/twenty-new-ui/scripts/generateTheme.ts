// Generates the theme-constants artifacts from the single source of truth
// (src/theme/tokens/themeTokens.ts):
//   - themeCssVariables.ts  (typed accessor: var(--t-*) references)
//   - theme-light.css        (.light { --t-*: <light value> })
//   - theme-dark.css         (.dark  { --t-*: <dark value> })
//
// Usage (from workspace root): npx nx generateTheme twenty-new-ui

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { themeTokens } from '../src/theme/tokens/themeTokens';

type ThemeLeaf = { light: string; dark: string };
type ThemeNode = { [key: string]: ThemeNode | ThemeLeaf };

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(scriptDir, '../src/theme-constants');

const isLeaf = (node: ThemeNode | ThemeLeaf): node is ThemeLeaf =>
  typeof (node as ThemeLeaf).light === 'string' &&
  typeof (node as ThemeLeaf).dark === 'string' &&
  Object.keys(node).length === 2;

// Each path segment: every uppercase letter -> "-" + lowercase (PascalCase keys
// gain a leading dash, mirroring the existing token names), and "." -> "_".
const pathToVarName = (path: string[]): string =>
  path
    .map((segment) =>
      segment
        .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
        .replace(/\./g, '_'),
    )
    .join('-');

type FlatLeaf = { path: string[]; light: string; dark: string };

const collectLeaves = (node: ThemeNode, path: string[] = []): FlatLeaf[] => {
  const leaves: FlatLeaf[] = [];
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (isLeaf(value))
      leaves.push({
        path: [...path, key],
        light: value.light,
        dark: value.dark,
      });
    else leaves.push(...collectLeaves(value, [...path, key]));
  }
  return leaves;
};

const leaves = collectLeaves(themeTokens as unknown as ThemeNode);

// --- themeCssVariables.ts ---

const referenceKey = (key: string): string =>
  /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `'${key}'`;

type RefNode = { [key: string]: RefNode | string };

const referenceTree: RefNode = {};
for (const { path } of leaves) {
  let node = referenceTree;
  for (let index = 0; index < path.length - 1; index++) {
    node[path[index]] ??= {};
    node = node[path[index]] as RefNode;
  }
  node[path[path.length - 1]] = `var(--t-${pathToVarName(path)})`;
}

const serializeReferences = (node: RefNode, indent: number): string => {
  const spaces = ' '.repeat(indent);
  const entries = Object.keys(node).map((key) => {
    const value = node[key];
    return typeof value === 'string'
      ? `${spaces}${referenceKey(key)}: '${value}',`
      : `${spaces}${referenceKey(key)}: ${serializeReferences(value, indent + 2)},`;
  });
  return `{\n${entries.join('\n')}\n${' '.repeat(indent - 2)}}`;
};

writeFileSync(
  resolve(outDir, 'themeCssVariables.ts'),
  `// This file is generated from src/theme/tokens/themeTokens.ts.
// Do not edit manually — regenerate with: npx nx generateTheme twenty-new-ui.
export const themeCssVariables = ${serializeReferences(referenceTree, 2)};
`,
  'utf8',
);

// --- theme-light.css / theme-dark.css ---

const buildCss = (scheme: 'light' | 'dark'): string => {
  const declarations = leaves
    .map(
      ({ path, light, dark }) =>
        `  --t-${pathToVarName(path)}: ${scheme === 'light' ? light : dark};`,
    )
    .join('\n');
  return `/* This file is generated from src/theme/tokens/themeTokens.ts.
   Do not edit manually — regenerate with: npx nx generateTheme twenty-new-ui. */

.${scheme} {
${declarations}
}
`;
};

writeFileSync(resolve(outDir, 'theme-light.css'), buildCss('light'), 'utf8');
writeFileSync(resolve(outDir, 'theme-dark.css'), buildCss('dark'), 'utf8');

console.log(`Generated theme-constants from ${leaves.length} tokens.`);
