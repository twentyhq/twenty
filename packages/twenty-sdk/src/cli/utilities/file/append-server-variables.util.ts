import { readFile, writeFile } from 'node:fs/promises';

import { pathExists } from '@/cli/utilities/file/fs-utils';

// One name + description pair to add to defineApplication.serverVariables.
// `isSecret` defaults to false; set true on credentials that should be
// stored encrypted and never echoed to the dev (e.g. client secrets).
export type ServerVariableSpec = {
  name: string;
  description: string;
  isSecret: boolean;
};

const APP_CONFIG_CANDIDATES = [
  'src/application.config.ts',
  'src/application-config.ts',
  'src/applicationConfig.ts',
];

const SERVER_VARIABLES_PATTERN = /serverVariables\s*:\s*\{/;
const DEFINE_APPLICATION_PATTERN = /defineApplication\s*\(\s*\{/;

// Auto-appends OAuth client_id / client_secret entries to the dev's
// `defineApplication({ serverVariables: { ... } })` block so they don't
// have to remember the wiring after `twenty add connection-provider`.
//
// Returns one of:
//   - { status: 'appended', file }     — wrote new entries to an existing block
//   - { status: 'created', file }       — added a fresh serverVariables block
//   - { status: 'skipped-existing' }    — all variables already declared
//   - { status: 'skipped-no-config' }   — couldn't find application.config.ts
//   - { status: 'skipped-no-app-call' } — file exists but lacks defineApplication(
//
// On `skipped-*`, the caller should print a manual snippet so the dev still
// knows what to paste — the helper is best-effort, not authoritative.
export type AppendResult =
  | { status: 'appended'; file: string }
  | { status: 'created'; file: string }
  | { status: 'skipped-existing' }
  | { status: 'skipped-no-config' }
  | { status: 'skipped-no-app-call' };

export const appendServerVariablesToAppConfig = async ({
  projectRoot,
  variables,
}: {
  projectRoot: string;
  variables: ServerVariableSpec[];
}): Promise<AppendResult> => {
  const configPath = await findAppConfigPath(projectRoot);

  if (configPath === null) {
    return { status: 'skipped-no-config' };
  }

  const original = await readFile(configPath, 'utf8');

  // Skip variables that are already declared anywhere in the file — a
  // crude check (key presence) but enough to avoid duplicate entries.
  const newVariables = variables.filter(
    (variable) => !new RegExp(`\\b${variable.name}\\s*:`).test(original),
  );

  if (newVariables.length === 0) {
    return { status: 'skipped-existing' };
  }

  const block = renderServerVariableEntries(newVariables);

  if (SERVER_VARIABLES_PATTERN.test(original)) {
    // Insert immediately after the opening `{` of the existing block.
    const updated = original.replace(
      SERVER_VARIABLES_PATTERN,
      (match) => `${match}\n${block}`,
    );

    await writeFile(configPath, updated, 'utf8');

    return { status: 'appended', file: configPath };
  }

  if (!DEFINE_APPLICATION_PATTERN.test(original)) {
    return { status: 'skipped-no-app-call' };
  }

  // Inject a fresh `serverVariables: { … },` property right before the
  // closing `})` of the defineApplication call. The closing pattern is
  // intentionally narrow (closing brace of the object literal followed by
  // the closing paren) to avoid eating other nested blocks.
  const updated = original.replace(/\n(\s*)\}\s*\)\s*;?\s*$/, (_, indent) => {
    const renderedBlock = renderFreshServerVariablesBlock(newVariables, indent);

    return `\n${indent}${renderedBlock}\n${indent}});\n`;
  });

  if (updated === original) {
    return { status: 'skipped-no-app-call' };
  }

  await writeFile(configPath, updated, 'utf8');

  return { status: 'created', file: configPath };
};

const findAppConfigPath = async (
  projectRoot: string,
): Promise<string | null> => {
  for (const candidate of APP_CONFIG_CANDIDATES) {
    const absolute = `${projectRoot}/${candidate}`;

    if (await pathExists(absolute)) {
      return absolute;
    }
  }

  return null;
};

const renderServerVariableEntries = (variables: ServerVariableSpec[]): string =>
  variables
    .map(
      ({ name, description, isSecret }) =>
        `    ${name}: {\n` +
        `      description: ${JSON.stringify(description)},\n` +
        `      isSecret: ${isSecret},\n` +
        `      isRequired: true,\n` +
        `    },`,
    )
    .join('\n');

const renderFreshServerVariablesBlock = (
  variables: ServerVariableSpec[],
  indent: string,
): string => {
  const entries = variables
    .map(
      ({ name, description, isSecret }) =>
        `${indent}  ${name}: {\n` +
        `${indent}    description: ${JSON.stringify(description)},\n` +
        `${indent}    isSecret: ${isSecret},\n` +
        `${indent}    isRequired: true,\n` +
        `${indent}  },`,
    )
    .join('\n');

  return `serverVariables: {\n${entries}\n${indent}},`;
};
