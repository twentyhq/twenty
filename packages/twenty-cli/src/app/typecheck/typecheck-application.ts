import { join, relative } from 'node:path';

import { isDefined } from 'twenty-shared/utils';
import type ts from 'typescript';

import { getToolingErrorContext } from '@/app/get-tooling-error-context';
import {
  type ToolingDiagnostic,
  type ToolingResult,
} from '@/app/types/tooling-result.type';
import { validateAppPath } from '@/app/snapshots/validate-app-path';
import { resolveProjectTypeScript } from '@/app/typecheck/resolve-project-typescript';
import {
  recordWatchFile,
  recordWatchProbe,
} from '@/app/dev/collect-watch-inputs';
import { CliError } from '@/output/cli-error';

const toDiagnostic = ({
  diagnostic,
  appPath,
  typescript,
}: {
  diagnostic: ts.Diagnostic;
  appPath: string;
  typescript: typeof ts;
}): ToolingDiagnostic => {
  const position =
    isDefined(diagnostic.file) && isDefined(diagnostic.start)
      ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
      : undefined;

  return {
    severity:
      diagnostic.category === typescript.DiagnosticCategory.Warning
        ? 'warning'
        : 'error',
    code: `TS${diagnostic.code}`,
    message: typescript.flattenDiagnosticMessageText(
      diagnostic.messageText,
      '\n',
    ),
    ...(isDefined(diagnostic.file)
      ? { file: relative(appPath, diagnostic.file.fileName) }
      : {}),
    ...(isDefined(position)
      ? { line: position.line + 1, column: position.character + 1 }
      : {}),
  };
};

const collectCompilerDiagnostics = ({
  appPath,
  typescript,
}: {
  appPath: string;
  typescript: typeof ts;
}): readonly ts.Diagnostic[] => {
  const configPath = join(appPath, 'tsconfig.json');
  const readFile: typeof typescript.sys.readFile = (path, encoding) => {
    recordWatchFile(path);

    return typescript.sys.readFile(path, encoding);
  };
  const config = typescript.readConfigFile(configPath, readFile);

  if (isDefined(config.error)) {
    return [config.error];
  }

  const parsed = typescript.parseJsonConfigFileContent(
    config.config,
    { ...typescript.sys, readFile },
    appPath,
    { noEmit: true },
    configPath,
  );

  if (parsed.errors.length > 0) {
    return parsed.errors;
  }

  const host = typescript.createCompilerHost(parsed.options);
  const hostReadFile = host.readFile;

  host.readFile = (path) => {
    recordWatchFile(path);

    return hostReadFile(path);
  };
  const hostFileExists = host.fileExists;

  host.fileExists = (path) => {
    const exists = hostFileExists(path);

    if (!exists) {
      recordWatchProbe(path);
    }

    return exists;
  };
  const program = typescript.createProgram({
    host,
    rootNames: parsed.fileNames,
    options: parsed.options,
    projectReferences: parsed.projectReferences,
  });

  return typescript.getPreEmitDiagnostics(program);
};

export const typecheckApplication = async ({
  appPath,
  signal,
}: {
  appPath: string;
  signal?: AbortSignal;
}): Promise<ToolingResult<null>> => {
  const validation = await validateAppPath(appPath);

  if (!validation.success) {
    return validation;
  }

  try {
    signal?.throwIfAborted();
    const typescript = await resolveProjectTypeScript(appPath);
    signal?.throwIfAborted();
    const compilerDiagnostics = collectCompilerDiagnostics({
      appPath,
      typescript,
    });

    signal?.throwIfAborted();

    const diagnostics = compilerDiagnostics.map((diagnostic) =>
      toDiagnostic({ diagnostic, appPath, typescript }),
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
        code: signal?.aborted
          ? 'CANCELLED'
          : error instanceof CliError
            ? error.code
            : 'TYPECHECK_FAILED',
        message: error instanceof Error ? error.message : String(error),
        ...getToolingErrorContext(error),
      },
      diagnostics: [],
    };
  }
};
