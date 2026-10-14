import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_PUBLISH_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['app', 'publish'],
  description: 'Build and publish the app package to npm',
  options: [
    {
      flags: '--path <directory>',
      description:
        'App directory (default: the app containing the current folder)',
    },
    {
      flags: '--tag <tag>',
      description: 'npm dist-tag, for example beta or next',
    },
  ],
  examples: [
    'twenty app publish',
    'twenty app publish --path ./apps/billing --tag beta --json',
  ],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: true,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/app/publish/run-app-publish-command'))
      .runAppPublishCommand,
};
