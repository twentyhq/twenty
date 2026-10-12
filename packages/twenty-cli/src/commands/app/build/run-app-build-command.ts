import { formatBuildSummary } from '@/app/format-build-summary';
import { runAppBuild } from '@/app/run-app-operation';
import { type CommandRun } from '@/catalog/types/command-run.type';

export const runAppBuildCommand: CommandRun = async (context) => {
  const { project, sdk, data, diagnostics, durationMilliseconds } =
    await runAppBuild({ context });

  return {
    data: {
      app: { path: project.path, name: project.name },
      sdk: { version: sdk.version },
      application: data.application,
      contentHash: data.contentHash,
      files: data.files,
      manifestFormat: data.manifestFormat,
      manifest: data.manifest,
      diagnostics,
      durationMilliseconds,
    },
    human: formatBuildSummary({
      build: data,
      durationMilliseconds,
    }),
  };
};
