import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AppFactoryPipelineResult } from '../core/app-factory-spec';
import { runAppFactoryPipeline } from '../core/pipeline';

type Pip3rOrchestratePayload = {
  spec?: unknown;
  specPath?: string;
  cwd?: string;
};

type Pip3rRequest = {
  action: 'orchestrate';
  payload: Pip3rOrchestratePayload;
};

type Pip3rResponse = {
  success: boolean;
  action: string;
  result?: AppFactoryPipelineResult;
  errors: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const readStdin = async (): Promise<string> => {
  const chunks: Buffer[] = [];

  return await new Promise((resolvePromise, rejectPromise) => {
    process.stdin.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    process.stdin.on('end', () => {
      resolvePromise(Buffer.concat(chunks).toString('utf8'));
    });
    process.stdin.on('error', (error) => {
      rejectPromise(error);
    });
  });
};

const createErrorResponse = (action: string, error: string): Pip3rResponse => {
  return {
    success: false,
    action,
    errors: [error],
  };
};

const parseRequest = (rawInput: string): Pip3rRequest | Pip3rResponse => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawInput);
  } catch {
    return createErrorResponse('unknown', 'stdin payload must be valid JSON');
  }

  if (!isRecord(parsed)) {
    return createErrorResponse('unknown', 'stdin payload must be a JSON object');
  }

  if (parsed.action !== 'orchestrate') {
    return createErrorResponse(
      String(parsed.action ?? 'unknown'),
      'unsupported action; expected "orchestrate"',
    );
  }

  if (!isRecord(parsed.payload)) {
    return createErrorResponse('orchestrate', 'payload must be a JSON object');
  }

  return {
    action: 'orchestrate',
    payload: parsed.payload as Pip3rOrchestratePayload,
  };
};

const resolveSpecInput = (
  payload: Pip3rOrchestratePayload,
): unknown | Pip3rResponse => {
  if (payload.spec !== undefined && payload.specPath !== undefined) {
    return createErrorResponse(
      'orchestrate',
      'provide either payload.spec or payload.specPath, not both',
    );
  }

  if (payload.spec !== undefined) {
    return payload.spec;
  }

  if (payload.specPath) {
    try {
      const absolutePath = resolve(payload.specPath);
      const fileContent = readFileSync(absolutePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      return createErrorResponse(
        'orchestrate',
        error instanceof Error ? error.message : 'failed to load payload.specPath',
      );
    }
  }

  return createErrorResponse(
    'orchestrate',
    'payload.spec or payload.specPath is required',
  );
};

const isPip3rResponse = (value: unknown): value is Pip3rResponse => {
  return (
    isRecord(value) &&
    typeof value.success === 'boolean' &&
    typeof value.action === 'string' &&
    Array.isArray(value.errors)
  );
};

export const executePip3rRequest = (request: Pip3rRequest): Pip3rResponse => {
  const specInput = resolveSpecInput(request.payload);

  if (isPip3rResponse(specInput)) {
    return specInput;
  }

  const result = runAppFactoryPipeline(specInput, { cwd: request.payload.cwd });

  return {
    success: result.success,
    action: request.action,
    result,
    errors: result.errors,
  };
};

const main = async (): Promise<void> => {
  try {
    const rawInput = await readStdin();
    const parsedRequest = parseRequest(rawInput);

    if (isPip3rResponse(parsedRequest)) {
      process.stdout.write(`${JSON.stringify(parsedRequest, null, 2)}\n`);
      process.exit(1);
    }

    const response = executePip3rRequest(parsedRequest);

    process.stdout.write(`${JSON.stringify(response, null, 2)}\n`);
    process.exit(response.success ? 0 : 1);
  } catch (error) {
    const response = createErrorResponse(
      'unknown',
      error instanceof Error ? error.message : 'unexpected pip3r bridge error',
    );
    process.stdout.write(`${JSON.stringify(response, null, 2)}\n`);
    process.exit(1);
  }
};

const isExecutedDirectly = (): boolean => {
  if (!process.argv[1]) {
    return false;
  }

  return resolve(process.argv[1]) === fileURLToPath(import.meta.url);
};

if (isExecutedDirectly()) {
  void main();
}
