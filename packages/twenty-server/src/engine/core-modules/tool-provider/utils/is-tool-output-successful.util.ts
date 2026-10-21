import { isFailedToolOutput } from 'src/engine/core-modules/tool-provider/utils/is-failed-tool-output.util';

export const isToolOutputSuccessful = (output: unknown): boolean =>
  !isFailedToolOutput(output);
