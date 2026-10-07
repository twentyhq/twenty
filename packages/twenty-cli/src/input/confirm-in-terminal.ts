import { createInterface } from 'node:readline/promises';

const YES_ANSWER_PATTERN = /^y(es)?$/i;

export const confirmInTerminal = async ({
  question,
  signal,
}: {
  question: string;
  signal: AbortSignal;
}) => {
  const terminal = createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  try {
    const answer = await terminal.question(`${question} [y/N] `, { signal });

    return YES_ANSWER_PATTERN.test(answer.trim());
  } finally {
    terminal.close();
  }
};
