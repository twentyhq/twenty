import { type CommandDefinition } from '@/catalog/types/command-definition.type';

export const getCommandName = (definition: CommandDefinition) =>
  definition.path.join(' ');
