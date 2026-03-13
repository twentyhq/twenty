import { exec } from 'node:child_process';

export const openBrowser = (url: string): Promise<boolean> => {
  const command =
    process.platform === 'darwin'
      ? `open "${url}"`
      : process.platform === 'win32'
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;

  return new Promise((resolve) => {
    exec(command, (error) => {
      resolve(!error);
    });
  });
};
