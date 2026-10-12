import { spawn } from 'node:child_process';

const getOpenCommand = (url: string): [string, string[]] => {
  if (process.platform === 'darwin') {
    return ['open', [url]];
  }

  if (process.platform === 'win32') {
    return ['rundll32', ['url.dll,FileProtocolHandler', url]];
  }

  return ['xdg-open', [url]];
};

export const openBrowser = (url: string) => {
  const [command, args] = getOpenCommand(url);
  const browserProcess = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });

  browserProcess.on('error', () => undefined);
  browserProcess.unref();
};
