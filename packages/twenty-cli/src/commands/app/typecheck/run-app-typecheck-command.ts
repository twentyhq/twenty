import { formatAppDuration } from '@/app/format-app-duration';
import { runAppTypecheck } from '@/app/run-app-operation';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { dimText, formatSuccessLine } from '@/output/style';

export const runAppTypecheckCommand: CommandRun = async (context) => {
  const { project, sdk, diagnostics, durationMilliseconds } =
    await runAppTypecheck({ context });

  return {
    data: {
      app: { path: project.path, name: project.name },
      sdk: { version: sdk.version },
      diagnostics,
      durationMilliseconds,
    },
    human: formatSuccessLine(
      `No type errors in ${project.name} ${dimText(`· project TypeScript · ${formatAppDuration(durationMilliseconds)}`)}`,
    ),
  };
};
