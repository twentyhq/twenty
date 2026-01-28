export type LogPrefix =
  | 'init'
  | 'dev-mode'
  | 'manifest-watch'
  | 'functions-watch'
  | 'front-components-watch';

export const getOutputByPrefix = (
  output: string,
  prefix: LogPrefix,
): string => {
  const prefixPattern = `[${prefix}]`;
  const lines = output.split('\n');

  return lines
    .filter((line) => line.includes(prefixPattern))
    .map((line) => {
      // Remove ANSI color codes for snapshot comparison
      const cleanLine = line.replace(/\x1B\[[0-9;]*m/g, '');
      return cleanLine.trim();
    })
    .join('\n');
};
