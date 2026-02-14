import prettier from '@prettier/sync';
import { type Options } from 'prettier';

const prettierConfigFile = prettier.resolveConfigFile();

if (prettierConfigFile == null) {
  throw new Error('Prettier config file not found');
}

const prettierConfiguration = prettier.resolveConfig(prettierConfigFile);

export const prettierFormat = (source: string, parser: Options['parser']) =>
  prettier.format(source, {
    ...prettierConfiguration,
    parser,
  });
