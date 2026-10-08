import { type CommandContext } from '@/catalog/types/command-context.type';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';

export type TargetCommandContext = CommandContext & {
  target: ResolvedTarget;
};
