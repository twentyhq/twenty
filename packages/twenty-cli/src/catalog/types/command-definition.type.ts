import { type CommandArgumentDefinition } from '@/catalog/types/command-argument-definition.type';
import { type CommandContext } from '@/catalog/types/command-context.type';
import { type CommandOptionDefinition } from '@/catalog/types/command-option-definition.type';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { type OutputMode } from '@/output/types/output-mode.type';

type BaseCommandDefinition = {
  path: string[];
  description: string;
  helpGroup?: string;
  arguments?: CommandArgumentDefinition[];
  options?: CommandOptionDefinition[];
  examples?: string[];
  outputModes: OutputMode[];
  writes: boolean;
  needsProject: boolean;
  requiredPermissions?: string[];
};

export type LocalCommandDefinition = BaseCommandDefinition & {
  needsTarget: false;
  load: () => Promise<CommandRun<CommandContext>>;
};

export type TargetCommandDefinition = BaseCommandDefinition & {
  needsTarget: true;
  load: () => Promise<CommandRun<TargetCommandContext>>;
};

export type CommandDefinition =
  | LocalCommandDefinition
  | TargetCommandDefinition;
