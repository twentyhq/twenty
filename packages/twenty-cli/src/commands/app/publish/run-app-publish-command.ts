import { isDefined } from 'twenty-shared/utils';

import { publishAppToNpm } from '@/app/publish/publish-app-to-npm';
import { withPackedApp } from '@/app/publish/with-packed-app';
import { runAppBuild } from '@/app/run-app-operation';
import { readStringOption } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { formatSuccessLine } from '@/output/style';

export const runAppPublishCommand: CommandRun = async (context) => {
  const tag = readStringOption(context.options, 'tag');

  if (isDefined(tag) && !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(tag)) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: `Invalid npm tag: ${tag}.`,
    });
  }

  if (isDefined(readStringOption(context.options, 'remote'))) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: 'npm publishing does not use a Twenty remote.',
    });
  }

  let published: Awaited<ReturnType<typeof publishAppToNpm>> | undefined;
  const { project, diagnostics } = await runAppBuild({
    context,
    useHeldBuild: async ({ project, data: build }) => {
      published = await withPackedApp({
        appPath: project.path,
        build,
        signal: context.signal,
        output: context.output,
        usePackage: (packedApp) =>
          publishAppToNpm({ packedApp, appPath: project.path, tag, context }),
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
      `Published ${published.name}@${published.version} to npm`,
    ),
  };
};
