import { isString } from '@sniptt/guards';
import { type RunAgentMessage } from 'twenty-shared/application';

export const toRunAgentMessages = (
  input: string | RunAgentMessage[],
): RunAgentMessage[] =>
  isString(input) ? [{ role: 'user', content: input }] : input;
