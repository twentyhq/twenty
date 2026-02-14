import prettier from '@prettier/sync';
import { type Options } from 'prettier';

export const prettierFormat = (source: string, parser: Options['parser']) => {
  const prettierConfigFile = prettier.resolveConfigFile();

  if (prettierConfigFile == null) {
    throw new Error('Prettier config file not found');
  }

  const prettierConfiguration = prettier.resolveConfig(prettierConfigFile);

  return prettier.format(source, {
    ...prettierConfiguration,
    parser,
  });
};
