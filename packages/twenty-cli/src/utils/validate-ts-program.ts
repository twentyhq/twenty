import ts from 'typescript';
import { getProgramFromTsconfig } from './get-program-from-tsconfig';

export const getTsProgramAndDiagnostics = async ({
  appPath,
}: {
  appPath: string;
}): Promise<{ program: ts.Program; diagnostics: ts.Diagnostic[] }> => {
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
