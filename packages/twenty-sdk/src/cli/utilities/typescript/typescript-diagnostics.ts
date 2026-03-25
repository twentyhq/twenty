import {
  type Diagnostic,
  formatDiagnosticsWithColorAndContext,
  sys,
} from 'typescript';

export const formatAndWarnTsDiagnostics = ({
  diagnostics,
}: {
  diagnostics: Diagnostic[];
}) => {
  if (diagnostics.length > 0) {
    const formattedDiagnostics = formatDiagnosticsWithColorAndContext(
      diagnostics,
      {
        getCanonicalFileName: (f) => f,
        getCurrentDirectory: sys.getCurrentDirectory,
        getNewLine: () => sys.newLine,
      },
    );

    console.warn(formattedDiagnostics);
  }
};
