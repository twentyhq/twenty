import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AppFactoryPipelineResult } from '../core/app-factory-spec';
import { runAppFactoryPipeline } from '../core/pipeline';

export type OrchestratorCliArgs = {
  specPath?: string;
  specJson?: string;
  cwd?: string;
};

type ParseCliArgsResult =
  | {
      success: true;
      args: OrchestratorCliArgs;
    }
  | {
      success: false;
      error: string;
    };

const getArgumentValue = (
  argv: string[],
  index: number,
): string | undefined => {
  const value = argv[index + 1];

  if (!value || value.startsWith('--')) {
    return undefined;
  }

  return value;
};

export const parseOrchestratorCliArgs = (argv: string[]): ParseCliArgsResult => {
  const args: OrchestratorCliArgs = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--spec') {
      const specPath = getArgumentValue(argv, index);
      if (!specPath) {
        return {
          success: false,
          error: '--spec requires a file path value',
        };
      }
      args.specPath = specPath;
      index += 1;
      continue;
    }

    if (token === '--spec-json') {
      const specJson = getArgumentValue(argv, index);
      if (!specJson) {
        return {
          success: false,
          error: '--spec-json requires a JSON string value',
        };
      }
      args.specJson = specJson;
      index += 1;
      continue;
    }

    if (token === '--cwd') {
      const cwd = getArgumentValue(argv, index);
      if (!cwd) {
        return {
          success: false,
          error: '--cwd requires a directory path value',
        };
      }
      args.cwd = cwd;
      index += 1;
      continue;
    }
  }

  if (args.specPath && args.specJson) {
    return {
      success: false,
      error: 'Use either --spec or --spec-json, not both',
    };
  }

  if (!args.specPath && !args.specJson) {
    return {
      success: false,
      error: 'Provide one input source with --spec or --spec-json',
    };
  }

  return {
    success: true,
    args,
  };
};

const loadSpec = (args: OrchestratorCliArgs): unknown => {
  if (args.specJson) {
    return JSON.parse(args.specJson);
  }

  const absolutePath = resolve(args.specPath!);
  const fileContent = readFileSync(absolutePath, 'utf8');

  return JSON.parse(fileContent);
};

const createFailureResult = (error: string): AppFactoryPipelineResult => {
  return {
    success: false,
    appDirectory: '',
    generatedFiles: [],
    commands: [],
    errors: [error],
  };
};

export const executeOrchestratorCli = (
  argv: string[],
): AppFactoryPipelineResult => {
  const parsedArgs = parseOrchestratorCliArgs(argv);

  if (parsedArgs.success === false) {
    return createFailureResult(parsedArgs.error);
  }

  let spec: unknown;
  try {
    spec = loadSpec(parsedArgs.args);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to parse spec input';
    return createFailureResult(message);
  }

  return runAppFactoryPipeline(spec, {
    cwd: parsedArgs.args.cwd,
  });
};

const main = (): void => {
  const result = executeOrchestratorCli(process.argv.slice(2));

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.success ? 0 : 1);
};

const isExecutedDirectly = (): boolean => {
  if (!process.argv[1]) {
    return false;
  }

  return resolve(process.argv[1]) === fileURLToPath(import.meta.url);
};

if (isExecutedDirectly()) {
  main();
}
