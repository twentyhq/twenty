import { isDefined } from 'twenty-shared/utils';

import { publishAppToServer } from '@/app/publish/publish-app-to-server';
import { resolveCommandTarget } from '@/program/resolve-command-target';
import { publishAppToNpm } from '@/app/publish/publish-app-to-npm';
import { withPackedApp } from '@/app/publish/with-packed-app';
import { runAppBuild } from '@/app/run-app-operation';
import {
  readBooleanOption,
  readStringOption,
} from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { formatSuccessLine } from '@/output/style';

export const runAppPublishCommand: CommandRun = async (context) => {
  const tag = readStringOption(context.options, 'tag');
  const isPrivate = readBooleanOption(context.options, 'private');

  if (isPrivate && isDefined(tag)) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: '--tag only applies to npm publishing.',
    });
  }

  if (isDefined(tag) && !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(tag)) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: `Invalid npm tag: ${tag}.`,
    });
  }

  if (!isPrivate && isDefined(readStringOption(context.options, 'remote'))) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: 'npm publishing does not use a Twenty remote.',
    });
  }

  const target = isPrivate ? await resolveCommandTarget(context) : undefined;
  let published:
    | Awaited<ReturnType<typeof publishAppToNpm | typeof publishAppToServer>>
    | undefined;
  const { project, diagnostics } = await runAppBuild({
    context,
    useHeldBuild: async ({ project, data: build }) => {
      published = await withPackedApp({
        appPath: project.path,
        build,
        signal: context.signal,
        output: context.output,
        usePackage: async (packedApp) => {
          if (isDefined(target)) {
            return publishAppToServer({
              packedApp,
              context: {
                target,
                signal: context.signal,
                output: context.output,
              },
            });
          }
          return publishAppToNpm({
            packedApp,
            appPath: project.path,
            tag,
            context,
          });
        },
      });
    },
  });

  if (!isDefined(published)) {
    throw new CliError({
      code: 'PUBLISH_FAILED',
      message: 'The build did not provide a package to publish.',
    });
  }

  return {
    data: {
      app: { path: project.path, name: project.name },
      ...published,
      diagnostics,
    },
    human: formatSuccessLine(
      `Published ${published.name}@${published.version} to ${target?.apiUrl ?? 'npm'}${isPrivate ? '. Existing installations may upgrade automatically.' : ''}`,
    ),
  };
};
