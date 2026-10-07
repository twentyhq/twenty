import { createOutput } from '@/output/create-output';
import { detectOutputMode } from '@/output/detect-output-mode';
import { toCliError } from '@/output/to-cli-error';
import { CommandParseError } from '@/program/command-parse-error';
import { ROOT_COMMAND_NAME } from '@/program/constants/root-command-name.constant';
import { createCommanderOutputCapture } from '@/program/create-commander-output-capture';
import { createProgram } from '@/program/create-program';
import { handleParseError } from '@/program/handle-parse-error';

export const runCli = async (args: string[]) => {
  const outputMode = detectOutputMode(args);
  const commanderOutput = createCommanderOutputCapture();
  const program = createProgram({
    outputMode,
    outputConfiguration: commanderOutput.configuration,
  });

  try {
    await program.parseAsync(args, { from: 'user' });
  } catch (error) {
    if (error instanceof CommandParseError) {
      await handleParseError({
        error,
        outputMode,
        capturedOutput: commanderOutput.captured,
      });

      return;
    }

    createOutput({ mode: outputMode, command: ROOT_COMMAND_NAME }).fail(
      toCliError(error),
    );
  }
};
