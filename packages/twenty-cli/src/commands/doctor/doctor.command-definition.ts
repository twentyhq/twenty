import { HELP_GROUP } from '@/catalog/constants/help-group.constant';
import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const DOCTOR_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['doctor'],
  description: 'Diagnose CLI, app SDK and workspace connection problems',
  helpGroup: HELP_GROUP.TOOLS,
  options: [
    { flags: '--path <directory>', description: 'App directory to inspect' },
    { flags: '--offline', description: 'Skip network checks' },
  ],
  examples: [
    'twenty doctor',
    'twenty doctor --remote staging --path ./my-app --json',
    'twenty doctor --offline',
  ],
  outputModes: ['human', 'json'],
  writes: false,
  needsProject: false,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/doctor/run-doctor-command')).runDoctorCommand,
};
