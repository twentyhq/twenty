import { join } from 'path';
import {
    createProgram,
    formatDiagnosticsWithColorAndContext,
    parseJsonConfigFileContent,
    readConfigFile,
    sys,
} from 'typescript';

export const getProgramFromTsconfig = ({
  appPath,
  tsconfigPath = 'tsconfig.json',
}: {
  appPath: string;
  tsconfigPath?: string;
}) => {
  const configFile = readConfigFile(join(appPath, tsconfigPath), sys.readFile);
  if (configFile.error)
    throw new Error(
      formatDiagnosticsWithColorAndContext([configFile.error], {
        getCanonicalFileName: (f) => f,
        getCurrentDirectory: sys.getCurrentDirectory,
        getNewLine: () => sys.newLine,
      }),
    );
  const parsed = parseJsonConfigFileContent(configFile.config, sys, appPath);
  if (parsed.errors.length) {
    throw new Error(
      formatDiagnosticsWithColorAndContext(parsed.errors, {
        getCanonicalFileName: (f) => f,
        getCurrentDirectory: sys.getCurrentDirectory,
        getNewLine: () => sys.newLine,
      }),
    );
  }
  return createProgram(parsed.fileNames, parsed.options);
};
