import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_TRANSLATIONS_EXTRACT_COMMAND_DEFINITION: LocalCommandDefinition =
  {
    path: ['app', 'translations', 'extract'],
    description: 'Extract app strings and update translation catalogs',
    options: [
      {
        flags: '--path <directory>',
        description:
          'App directory (default: the app containing the current folder)',
      },
      {
        flags: '--locale <locale>',
        description:
          'Create a target locale catalog if missing, for example fr-FR',
      },
    ],
    examples: [
      'twenty app translations extract',
      'twenty app translations extract --locale fr-FR',
      'twenty app translations extract --path ./apps/billing --json',
    ],
    outputModes: ['human', 'json'],
    writes: true,
    needsProject: true,
    needsTarget: false,
    load: async () =>
      (
        await import('@/commands/app/translations/extract/run-app-translations-extract-command')
      ).runAppTranslationsExtractCommand,
  };
