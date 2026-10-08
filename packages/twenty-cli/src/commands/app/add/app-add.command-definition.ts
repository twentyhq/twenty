import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_ADD_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['app', 'add'],
  description:
    'Add an object, field, logic function or front component to an app',
  arguments: [
    {
      name: 'entity',
      description:
        'object, field, logic-function or front-component (prompted when omitted)',
      required: false,
    },
  ],
  options: [
    {
      flags: '--path <directory>',
      description:
        'App directory (default: the app containing the current folder)',
    },
    {
      flags: '--name <name>',
      description: 'Definition name; also determines the generated filename',
    },
    {
      flags: '--create-view',
      description: 'Create a table view for the new object',
    },
    {
      flags: '--create-navigation-menu-item',
      description: 'Create a navigation menu item for the new object',
    },
    {
      flags: '--create-page-layout',
      description:
        'Create a record page layout and its fields view for the new object',
    },
    { flags: '--name-plural <name>', description: 'Plural API name (object)' },
    {
      flags: '--label <label>',
      description:
        'Display label (object or field; default: derived from name)',
    },
    {
      flags: '--label-plural <label>',
      description:
        'Plural display label (object; default: derived from plural name)',
    },
    {
      flags: '--type <type>',
      description:
        'Field type, for example TEXT, NUMBER or RELATION (default: TEXT)',
    },
    {
      flags: '--object <uuid>',
      description: 'Parent object universal identifier (field)',
    },
    { flags: '--description <text>', description: 'Field description' },
    {
      flags: '--target-object <uuid>',
      description: 'Target object universal identifier (relation field)',
    },
    {
      flags: '--target-field <uuid>',
      description: 'Target field universal identifier (relation field)',
    },
    {
      flags: '--relation-type <type>',
      description:
        'ONE_TO_MANY or MANY_TO_ONE (relation field; default: ONE_TO_MANY)',
    },
    {
      flags: '--on-delete <action>',
      description:
        'CASCADE, RESTRICT, SET_NULL, NO_ACTION or None (relation field; default: CASCADE)',
    },
  ],
  examples: [
    'twenty app add',
    'twenty app add object --name invoice --name-plural invoices --no-input',
    'twenty app add object --name invoice --name-plural invoices --create-view --create-navigation-menu-item --create-page-layout --no-input',
    'twenty app add field --name amount --type NUMBER --object <object-universal-identifier> --json',
    'twenty app add logic-function --name send-invoice --no-input',
    'twenty app add front-component --name invoice-panel --no-input',
  ],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: true,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/app/add/run-app-add-command')).runAppAddCommand,
};
