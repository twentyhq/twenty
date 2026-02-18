import { execFile } from 'node:child_process';
import type * as esbuild from 'esbuild';
import path from 'node:path';

export type TypecheckError = {
  text: string;
  file: string;
  line: number;
  column: number;
};

const TSC_ERROR_REGEX = /^(.+)\((\d+),(\d+)\): error TS\d+: (.+)$/;

export const parseTscOutputLine = (line: string): TypecheckError | null => {
  const match = line.match(TSC_ERROR_REGEX);

  if (!match) {
    return null;
  }

  const [, filePath, lineStr, columnStr, text] = match;

  return {
    text,
    file: filePath,
    line: Number(lineStr),
    column: Number(columnStr) - 1,
  };
};

const parseTscOutput = (output: string): TypecheckError[] => {
  const errors: TypecheckError[] = [];

  for (const line of output.split('\n')) {
    const error = parseTscOutputLine(line);

    if (error) {
      errors.push(error);
    }
  }

  return errors;
};

export const runTypecheck = (appPath: string): Promise<TypecheckError[]> => {
  const tsconfigPath = path.join(appPath, 'tsconfig.json');
  const tscPath = path.join(appPath, 'node_modules', '.bin', 'tsc');

  return new Promise((resolve) => {
    execFile(
      tscPath,
      ['--noEmit', '--pretty', 'false', '-p', tsconfigPath],
      { cwd: appPath },
      (_error, stdout, stderr) => {
        resolve(parseTscOutput(stderr || stdout));
      },
    );
  });
};

const toEsbuildErrors = (errors: TypecheckError[]): esbuild.PartialMessage[] =>
  errors.map((error) => ({
    text: error.text,
    location: {
      file: error.file,
      line: error.line,
      column: error.column,
      lineText: '',
      length: 0,
      namespace: '',
      suggestion: '',
    },
  }));

export const createTypecheckPlugin = (appPath: string): esbuild.Plugin => ({
  name: 'typecheck',
  setup: (build) => {
    build.onStart(async () => {
      const errors = await runTypecheck(appPath);

      return { errors: toEsbuildErrors(errors) };
    });
  },
});
