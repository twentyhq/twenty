export const sanitizeAnsi = (output: string): string =>
  output.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
