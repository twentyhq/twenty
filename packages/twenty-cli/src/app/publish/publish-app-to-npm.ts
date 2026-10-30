import { isDefined } from 'twenty-shared/utils';

import { runNpmCommand } from '@/app/publish/run-npm-command';
import { type PackedApp } from '@/app/publish/types/packed-app.type';
import { type CommandContext } from '@/catalog/types/command-context.type';
import { isInteractionAllowed } from '@/program/is-interaction-allowed';

export const publishAppToNpm = async ({
  packedApp,
  appPath,
  tag,
  context,
}: {
  packedApp: PackedApp;
  appPath: string;
  tag?: string;
  context: Pick<CommandContext, 'options' | 'outputMode' | 'output' | 'signal'>;
}) => {
  const supportsProvenance =
    isDefined(process.env.ACTIONS_ID_TOKEN_REQUEST_URL) &&
    process.env.TWENTY_APP_PUBLISH_DISABLE_PROVENANCE !== 'true';

  context.output.progress({
    message: `Publishing ${packedApp.name}@${packedApp.version} to npm…`,
  });
  await runNpmCommand({
    args: [
      'publish',
      packedApp.path,
      '--access',
      'public',
      '--ignore-scripts',
      '--workspaces=false',
      ...(supportsProvenance ? ['--provenance'] : []),
      ...(isDefined(tag) ? ['--tag', tag] : []),
    ],
    appPath,
    signal: context.signal,
    canInteract: isInteractionAllowed(context),
    ...(context.outputMode === 'human'
      ? { onOutput: (message: string) => context.output.progress({ message }) }
      : {}),
  });

  return {
    target: 'npm',
    name: packedApp.name,
    version: packedApp.version,
    ...(isDefined(tag) ? { tag } : {}),
  };
};
