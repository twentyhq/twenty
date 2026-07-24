import { createInterface } from 'node:readline/promises';

export const askCommandConfirmation = async (
  message: string,
): Promise<boolean> => {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await readline.question(`${message} (y/N): `);

    return answer.trim().toLowerCase() === 'y';
  } finally {
    readline.close();
  }
};
