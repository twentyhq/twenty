import { constants } from 'node:fs';
import { access, realpath, stat } from 'node:fs/promises';
import { delimiter, dirname, join, resolve } from 'node:path';

import { isString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import { listAncestorDirectories } from '@/app/project/list-ancestor-directories';
import { readJsonObject } from '@/app/read-json-object';
import { type DoctorCheck } from '@/doctor/types/doctor-check.type';

const readExecutableOwner = async (executable: string) => {
  for (const directory of listAncestorDirectories(dirname(executable))) {
    const manifest = await readJsonObject(join(directory, 'package.json'));

    if (!isDefined(manifest)) {
      continue;
    }

    const bin = manifest.bin;
    const declaredBin =
      isString(bin) && manifest.name === 'twenty' ? bin : undefined;
    const namedBin =
      isPlainObject(bin) && isString(bin.twenty) ? bin.twenty : declaredBin;

    if (
      isDefined(namedBin) &&
      (await realpath(resolve(directory, namedBin)).catch(() => undefined)) ===
        executable
    ) {
      return {
        name: isString(manifest.name) ? manifest.name : 'unknown',
        version: isString(manifest.version) ? manifest.version : 'unknown',
      };
    }
  }

  return null;
};

export const getPathDoctorCheck = async ({
  environment,
  workingDirectory,
  signal,
}: {
  environment: NodeJS.ProcessEnv;
  workingDirectory: string;
  signal: AbortSignal;
}): Promise<DoctorCheck> => {
  const candidates: {
    path: string;
    resolvedPath: string;
    owner: { name: string; version: string } | null;
  }[] = [];
  const names =
    process.platform === 'win32'
      ? ['twenty.exe', 'twenty.cmd', 'twenty.bat', 'twenty']
      : ['twenty'];

  const directories = isDefined(environment.PATH)
    ? environment.PATH.split(delimiter)
    : [];

  for (const directory of new Set(directories)) {
    for (const name of names) {
      signal.throwIfAborted();

      const candidate = resolve(workingDirectory, directory, name);
      const isExecutable = await access(candidate, constants.X_OK).then(
        () => stat(candidate).then((value) => value.isFile()),
        () => false,
      );

      if (!isExecutable) {
        continue;
      }

      const resolvedPath = await realpath(candidate);

      candidates.push({
        path: candidate,
        resolvedPath,
        owner: await readExecutableOwner(resolvedPath),
      });
    }
  }

  const first = candidates[0];
  const runningEntry = process.argv[1];
  const runningPath = isDefined(runningEntry)
    ? await realpath(resolve(workingDirectory, runningEntry)).catch(
        () => undefined,
      )
    : undefined;
  const legacy = candidates.filter(
    (entry) => entry.owner?.name === 'twenty-sdk',
  );

  if (isNonEmptyArray(legacy)) {
    return {
      id: 'path',
      status: 'warning',
      message: `PATH contains legacy twenty-sdk executable(s) named twenty: ${legacy.map((entry) => entry.path).join(', ')}.`,
      hint: 'If this is a global twenty-sdk installation, remove it before installing the twenty CLI so the CLI owns the twenty name. Removing the SDK afterward can remove that executable link. Keep app-local SDK dependencies; use the intended CLI by its full path when needed. Doctor does not change installations.',
      details: { candidates },
    };
  }

  if (!isDefined(first)) {
    return {
      id: 'path',
      status: 'warning',
      message: 'No executable named twenty was found on PATH.',
      hint: 'Use the CLI entry point shown above, or your package manager to invoke the installed CLI.',
      details: { candidates },
    };
  }

  if (isDefined(runningPath) && first.resolvedPath !== runningPath) {
    return {
      id: 'path',
      status: 'warning',
      message: `${first.path} is first on PATH and differs from the running CLI.`,
      hint: 'Use the intended executable by its full path, or review PATH order. Shell aliases, functions and command caches are not inspected.',
      details: { candidates, runningPath },
    };
  }

  return {
    id: 'path',
    status: first.owner?.name === 'twenty' ? 'pass' : 'warning',
    message: isDefined(first.owner)
      ? `First twenty executable on PATH: ${first.path} (${first.owner.name} ${first.owner.version}).`
      : `First twenty executable on PATH: ${first.path}. Its package owner could not be determined.`,
    hint: 'Shell aliases, functions and command caches are not inspected.',
    details: { candidates },
  };
};
