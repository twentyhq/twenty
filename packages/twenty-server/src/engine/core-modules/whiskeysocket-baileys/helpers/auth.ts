import readline from 'readline';

export const question = (text: string): Promise<string> =>
  new Promise<string>((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(text, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
