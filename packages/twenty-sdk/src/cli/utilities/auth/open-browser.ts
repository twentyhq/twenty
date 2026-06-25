import { execFile } from 'node:child_process';

export const openBrowser = (url: string): Promise<boolean> => {
  try {
    new URL(url);
  } catch {
    return Promise.resolve(false);
  }

  const [command, args]: [string, string[]] =
    process.platform === 'darwin'
      ? ['open', [url]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', url]]
        : ['xdg-open', [url]];

  return new Promise((resolve) => {
    execFile(command, args, (error) => {
      resolve(!error);
    });
  });
};
