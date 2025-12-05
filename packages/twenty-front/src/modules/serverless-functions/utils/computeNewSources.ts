import { type Sources } from 'twenty-shared/types';

export const computeNewSources = ({
  previousCode,
  filePath,
  value,
}: {
  previousCode: Sources;
  filePath: string;
  value: string;
}): Sources => {
  const result = { ...previousCode };

  const parts = filePath.split('/').filter(Boolean);

  if (parts.length === 0) {
    return result;
  }

  if (parts.length === 1) {
    result[filePath] = value;

    return result;
  }

  const [root, ...rest] = parts;

  const newFilePath = rest.join('/');

  if (
    typeof result?.[root] === 'string' ||
    typeof previousCode[root] === 'string'
  ) {
    throw Error('Cannot compute new code input');
  }

  return {
    ...previousCode,
    [root]: {
      ...previousCode[root],
      ...computeNewSources({
        previousCode: result?.[root] ?? {},
        filePath: newFilePath,
        value,
      }),
    },
  };
};
