import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

type NxTarget = {
  dependsOn?: string[];
  options?: {
    command?: string;
  };
};

type NxProject = {
  targets?: Record<string, NxTarget>;
};

type NxWorkspace = {
  targetDefaults?: Record<string, NxTarget>;
};

type OxlintConfig = {
  jsPlugins?: string[];
};

const LINT_DIFF_WITH_MAIN_TARGET = 'lint:diff-with-main';
const OXLINT_PLUGIN_PATH = '../twenty-oxlint-rules/dist/oxlint-plugin.mjs';
const OXLINT_PLUGIN_BUILD_TARGET = 'twenty-oxlint-rules:build';
const WORKSPACE_ROOT = fileURLToPath(new URL('../../..', import.meta.url));

const readJson = <JsonShape>(path: string): JsonShape =>
  JSON.parse(readFileSync(`${WORKSPACE_ROOT}/${path}`, 'utf8'));

const nxWorkspace = readJson<NxWorkspace>('nx.json');

const getLintDiffWithMainDefaultDependsOn = () =>
  nxWorkspace.targetDefaults?.[LINT_DIFF_WITH_MAIN_TARGET]?.dependsOn ?? [];

const getLintDiffWithMainDependsOn = (projectConfigPath: string) => {
  const project = readJson<NxProject>(projectConfigPath);
  const projectTarget = project.targets?.[LINT_DIFF_WITH_MAIN_TARGET];

  if (projectTarget?.options?.command !== undefined) {
    return projectTarget.dependsOn ?? [];
  }

  return (
    projectTarget?.dependsOn ??
    nxWorkspace.targetDefaults?.[LINT_DIFF_WITH_MAIN_TARGET]?.dependsOn ??
    []
  );
};

const projectUsesTwentyOxlintPlugin = (oxlintConfigPath: string) => {
  const oxlintConfig = readJson<OxlintConfig>(oxlintConfigPath);

  return oxlintConfig.jsPlugins?.includes(OXLINT_PLUGIN_PATH) ?? false;
};

describe('lint:diff-with-main workspace targets', () => {
  it('builds the Twenty oxlint plugin before running the default lint:diff-with-main target', () => {
    expect(getLintDiffWithMainDefaultDependsOn()).toContain(
      OXLINT_PLUGIN_BUILD_TARGET,
    );
  });

  it.each([
    {
      projectConfigPath: 'packages/twenty-front/project.json',
      oxlintConfigPath: 'packages/twenty-front/.oxlintrc.json',
    },
    {
      projectConfigPath: 'packages/twenty-server/project.json',
      oxlintConfigPath: 'packages/twenty-server/.oxlintrc.json',
    },
  ])(
    'builds the Twenty oxlint plugin before running the custom $projectConfigPath target',
    ({ projectConfigPath, oxlintConfigPath }) => {
      expect(projectUsesTwentyOxlintPlugin(oxlintConfigPath)).toBe(true);
      expect(getLintDiffWithMainDependsOn(projectConfigPath)).toContain(
        OXLINT_PLUGIN_BUILD_TARGET,
      );
    },
  );

  it('preserves custom lint:diff-with-main dependencies for projects that do not use the Twenty oxlint plugin', () => {
    expect(
      projectUsesTwentyOxlintPlugin(
        'packages/twenty-website-new/.oxlintrc.json',
      ),
    ).toBe(false);
    expect(
      getLintDiffWithMainDependsOn('packages/twenty-website-new/project.json'),
    ).toEqual([
      'check-boundaries',
      'check-section-shape',
      'check-lottie-frames',
    ]);
  });
});
