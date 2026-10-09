import { readdir, stat } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { listAncestorDirectories } from '@/app/project/list-ancestor-directories';
import { readJsonObject } from '@/app/read-json-object';
import { type AppProject } from '@/app/project/types/app-project.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
];

const readAppProject = async (
  directory: string,
): Promise<AppProject | undefined> => {
  const packageJson = await readJsonObject(join(directory, 'package.json'));

  if (!isDefined(packageJson)) {
    return undefined;
  }

  const dependsOnSdk = DEPENDENCY_FIELDS.some((field) => {
    const dependencies = packageJson[field];

    return (
      isPlainObject(dependencies) && Object.hasOwn(dependencies, 'twenty-sdk')
    );
  });

  if (!dependsOnSdk) {
    return undefined;
  }

  return {
    path: directory,
    name: isNonEmptyString(packageJson.name)
      ? packageJson.name
      : basename(directory),
  };
};

const findChildAppProjects = async (directory: string) => {
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    () => [],
  );
  const projects = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isDirectory() &&
          !entry.name.startsWith('.') &&
          entry.name !== 'node_modules',
      )
      .map((entry) => readAppProject(join(directory, entry.name))),
  );

  return projects
    .filter(isDefined)
    .sort((first, second) => first.path.localeCompare(second.path));
};

const findEnclosingAppProject = async (directory: string) => {
  for (const candidate of listAncestorDirectories(directory)) {
    const project = await readAppProject(candidate);

    if (isDefined(project)) {
      return project;
    }
  }

  return undefined;
};

export const resolveAppProject = async ({
  explicitPath,
  workingDirectory,
}: {
  explicitPath?: string;
  workingDirectory: string;
}): Promise<AppProject> => {
  if (isDefined(explicitPath)) {
    const appPath = resolve(workingDirectory, explicitPath);
    const appPathStats = await stat(appPath).catch(() => undefined);
    const project =
      isDefined(appPathStats) && appPathStats.isDirectory()
        ? await readAppProject(appPath)
        : undefined;

    if (!isDefined(project)) {
      throw new CliError({
        code: 'APP_NOT_FOUND',
        exitCode: EXIT_CODE.USAGE,
        message: `${appPath} is not a Twenty app: it needs a package.json that depends on twenty-sdk.`,
        details: { path: appPath },
      });
    }

    return project;
  }

  const enclosingProject = await findEnclosingAppProject(workingDirectory);

  if (isDefined(enclosingProject)) {
    return enclosingProject;
  }

  const candidates = await findChildAppProjects(workingDirectory);
  const candidatePaths = candidates.map(
    (candidate) => `./${relative(workingDirectory, candidate.path)}`,
  );

  if (candidates.length > 1) {
    throw new CliError({
      code: 'APP_PATH_REQUIRED',
      exitCode: EXIT_CODE.USAGE,
      message: `This folder contains ${candidates.length} apps. Choose one with --path.`,
      hint: `Apps here: ${candidatePaths.join(', ')}`,
      details: { candidates: candidates.map((candidate) => candidate.path) },
    });
  }

  throw new CliError({
    code: 'APP_NOT_FOUND',
    exitCode: EXIT_CODE.USAGE,
    message: 'No Twenty app found in this folder or its parents.',
    hint:
      candidates.length === 1
        ? `Pass --path ${candidatePaths[0]}`
        : 'Run the command inside an app, or pass --path <app directory>.',
    details: { workingDirectory },
  });
};
