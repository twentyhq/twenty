import { join, relative } from 'node:path';
import ts from 'typescript';
import {
  type ToolingDiagnostic,
  type ToolingOperationOptions,
  type ToolingResult,
} from '@/tooling/types';
import { isDefined } from 'twenty-shared/utils';

import { validateAppPath } from '@/tooling/validate-app-path';

const toDiagnostic = (
  diagnostic: ts.Diagnostic,
  appPath: string,
): ToolingDiagnostic => {
  const position =
    isDefined(diagnostic.file) && isDefined(diagnostic.start)
      ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
      : undefined;

  return {
    severity:
      diagnostic.category === ts.DiagnosticCategory.Warning
        ? 'warning'
        : 'error',
    code: `TS${diagnostic.code}`,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    ...(isDefined(diagnostic.file)
      ? { file: relative(appPath, diagnostic.file.fileName) }
      : {}),
    ...(isDefined(position)
      ? { line: position.line + 1, column: position.character + 1 }
      : {}),
  };
};

export const typecheckApplication = async ({
  appPath,
  signal,
}: ToolingOperationOptions): Promise<ToolingResult<null>> => {
  const validation = await validateAppPath(appPath);

  if (!validation.success) {
    return validation;
  }

  try {
    signal?.throwIfAborted();
    const configPath = join(appPath, 'tsconfig.json');
    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    let compilerDiagnostics: readonly ts.Diagnostic[];

    if (isDefined(config.error)) {
      compilerDiagnostics = [config.error];
    } else {
      const parsed = ts.parseJsonConfigFileContent(
        config.config,
        ts.sys,
        appPath,
        { noEmit: true },
        configPath,
      );

      if (parsed.errors.length > 0) {
        compilerDiagnostics = parsed.errors;
      } else {
        const program = ts.createProgram({
          rootNames: parsed.fileNames,
          options: parsed.options,
          projectReferences: parsed.projectReferences,
        });

        compilerDiagnostics = ts.getPreEmitDiagnostics(program);
      }
    }

    signal?.throwIfAborted();

    const diagnostics = compilerDiagnostics.map((diagnostic) =>
      toDiagnostic(diagnostic, appPath),
    );

    return diagnostics.some((diagnostic) => diagnostic.severity === 'error')
      ? {
          success: false,
          error: { code: 'TYPECHECK_FAILED', message: 'Typecheck failed.' },
          diagnostics,
        }
      : { success: true, data: null, diagnostics };
  } catch (error) {
    return {
      success: false,
      error: {
        code: signal?.aborted ? 'CANCELLED' : 'TYPECHECK_FAILED',
        message: error instanceof Error ? error.message : String(error),
      },
      diagnostics: [],
    };
  }
};
