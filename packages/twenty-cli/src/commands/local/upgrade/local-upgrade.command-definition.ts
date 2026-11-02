import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const LOCAL_UPGRADE_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['local', 'upgrade'],
  description: 'Upgrade the local environment, preserving its data volumes',
  options: [
    {
      flags: '--test',
      description: 'Use the separate local test instance',
    },
  ],
  arguments: [
    {
      name: 'version',
      description:
        'Twenty version or image tag (default: engines.twenty, then latest)',
      required: false,
    },
  ],
  examples: ['twenty local upgrade', 'twenty local upgrade 2.53.1 --test'],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: false,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/local/upgrade/run-local-upgrade-command'))
      .runLocalUpgradeCommand,
};
