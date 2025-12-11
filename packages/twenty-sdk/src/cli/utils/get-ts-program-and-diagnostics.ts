import { join } from 'path';
import {
  createProgram,
  formatDiagnosticsWithColorAndContext,
  parseJsonConfigFileContent,
  readConfigFile,
  sys,
  type Program,
  type Diagnostic,
} from 'typescript';

const getProgramFromTsconfig = ({
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

export const getTsProgramAndDiagnostics = async ({
  appPath,
}: {
  appPath: string;
}): Promise<{ program: Program; diagnostics: Diagnostic[] }> => {
  const program = getProgramFromTsconfig({
    appPath,
    tsconfigPath: 'tsconfig.json',
  });

  return {
    diagnostics: [
      ...program.getSyntacticDiagnostics(),
      ...program.getSemanticDiagnostics(),
      ...program.getGlobalDiagnostics(),
    ],
    program,
  };
};
