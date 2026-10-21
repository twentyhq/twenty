import { promptInTerminal } from '@/input/prompt-in-terminal';

const YES_ANSWER_PATTERN = /^y(es)?$/i;

export const confirmInTerminal = async ({
  question,
  signal,
}: {
  question: string;
  signal: AbortSignal;
}) => {
  const answer = await promptInTerminal({
    question: `${question} [y/N] `,
    signal,
  });

  return YES_ANSWER_PATTERN.test(answer.trim());
};
