import { type OutputMode } from '@/output/types/output-mode.type';
import { type Output } from '@/output/types/output.type';

export type CommandContext = {
  command: string;
  arguments: unknown[];
  options: Record<string, unknown>;
  output: Output;
  outputMode: OutputMode;
  signal: AbortSignal;
};
