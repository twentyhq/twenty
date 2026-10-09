import { AsyncLocalStorage } from 'node:async_hooks';
import { realpathSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { type Plugin } from 'esbuild';
import { isDefined } from 'twenty-shared/utils';

import { isIgnoredWatchPath } from '@/app/dev/is-ignored-watch-path';
import { readWatchInputStamp } from '@/app/dev/read-watch-input-stamp';
import { type WatchInput } from '@/app/dev/types/watch-inputs.type';

type InputCollection = {
  inputs: Map<string, WatchInput>;
  probes: Map<string, WatchInput>;
};

const watchInputs = new AsyncLocalStorage<InputCollection>();

export const collectWatchInputs = async <TResult>(
  run: () => Promise<TResult>,
) => {
  const inputs = new Map<string, WatchInput>();
  const probes = new Map<string, WatchInput>();
  const result = await watchInputs.run({ inputs, probes }, run);
  const sourceDirectories = new Set(
    [...inputs.values()]
      .filter((input) => input.kind === 'file' && input.stamp !== null)
      .map((input) => dirname(input.path)),
  );

  for (const [key, probe] of probes) {
    if (sourceDirectories.has(dirname(probe.path)) && !inputs.has(key)) {
      inputs.set(key, probe);
    }
  }

  return { result, watchInputs: [...inputs.values()] };
};

const recordInput = (
  inputs: Map<string, WatchInput>,
  path: string,
  kind: WatchInput['kind'],
) => {
  let canonicalPath: string;

  try {
    canonicalPath = realpathSync(path);
  } catch {
    canonicalPath = resolve(path);
  }

  if (isIgnoredWatchPath(canonicalPath)) {
    return;
  }

  const key = `${kind}:${canonicalPath}`;

  if (!inputs.has(key)) {
    const input = { path: canonicalPath, kind };

    inputs.set(key, { ...input, stamp: readWatchInputStamp(input) });
  }

  return canonicalPath;
};

const recordParent = (inputs: Map<string, WatchInput>, path: string) => {
  let parent = dirname(path);

  while (dirname(parent) !== parent) {
    try {
      if (statSync(parent).isDirectory()) {
        recordInput(inputs, parent, 'directory');

        return;
      }
    } catch {}

    parent = dirname(parent);
  }
};

export const recordWatchFile = (path: string) => {
  const collection = watchInputs.getStore();

  if (!isDefined(collection)) {
    return;
  }

  const canonicalPath = recordInput(collection.inputs, path, 'file');
  if (isDefined(canonicalPath)) recordParent(collection.inputs, canonicalPath);
};

export const recordWatchProbe = (path: string) => {
  const collection = watchInputs.getStore();

  if (isDefined(collection)) recordInput(collection.probes, path, 'file');
};

export const getWatchInputPlugins = (): Plugin[] => {
  const collection = watchInputs.getStore();

  if (!isDefined(collection)) {
    return [];
  }

  const { inputs } = collection;

  return [
    {
      name: 'collect-watch-inputs',
      setup: (build) => {
        build.onLoad({ filter: /.*/, namespace: 'file' }, ({ path }) => {
          const canonicalPath = recordInput(inputs, path, 'file');
          if (isDefined(canonicalPath)) recordParent(inputs, canonicalPath);

          return undefined;
        });
        build.onResolve({ filter: /^\./ }, ({ path, resolveDir }) => {
          if (resolveDir.length > 0) {
            recordParent(inputs, resolve(resolveDir, path));
          }

          return undefined;
        });
      },
    },
  ];
};
