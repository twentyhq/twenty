import { execFile } from 'node:child_process';
import type * as esbuild from 'esbuild';
import path from 'node:path';

export type TypecheckError = {
  text: string;
  file: string;
  line: number;
  column: number;
};

const parseTscOutput = (output: string): TypecheckError[] => {
  const lines = output.split('\n');
  const errors: TypecheckError[] = [];

  for (const line of lines) {
    const match = line.match(/^(.+)\((\d+),(\d+)\): error TS\d+: (.+)$/);

    if (!match) {
      continue;
    }

    const [, filePath, lineStr, columnStr, text] = match;

    errors.push({
      text,
      file: filePath,
      line: Number(lineStr),
      column: Number(columnStr) - 1,
    });
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

const toEsbuildErrors = (
  errors: TypecheckError[],
): esbuild.PartialMessage[] =>
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
