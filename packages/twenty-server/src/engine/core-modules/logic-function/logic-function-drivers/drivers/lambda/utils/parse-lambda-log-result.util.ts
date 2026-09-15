export type ParsedLambdaLogResult = {
  logs: string;
  initDurationMs: string | null;
  billedDurationMs: string | null;
  reportDurationMs: string | null;
  coldStart: boolean;
};

const EMPTY_PARSED_LAMBDA_LOG_RESULT: ParsedLambdaLogResult = {
  logs: '',
  initDurationMs: null,
  billedDurationMs: null,
  reportDurationMs: null,
  coldStart: false,
};

export const parseLambdaLogResult = (
  logResult: string | undefined,
): ParsedLambdaLogResult => {
  if (!logResult) {
    return EMPTY_PARSED_LAMBDA_LOG_RESULT;
  }

  const decoded = Buffer.from(logResult, 'base64').toString('utf8');

  const initDurationMs =
    decoded.match(/Init Duration:\s*([\d.]+)\s*ms/i)?.[1] ?? null;
  const billedDurationMs =
    decoded.match(/Billed Duration:\s*([\d.]+)\s*ms/i)?.[1] ?? null;
  const reportDurationMs =
    decoded.match(/\bDuration:\s*([\d.]+)\s*ms/i)?.[1] ?? null;

  const logs = decoded
    .split('\t')
    .join(' ')
    .replace(/^(START|END|REPORT).*\n?/gm, '')
    .replace(
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z) [a-f0-9-]+ INFO /gm,
      '$1 INFO ',
    )
    .trim();

  return {
    logs,
    initDurationMs,
    billedDurationMs,
    reportDurationMs,
    coldStart: initDurationMs !== null,
  };
};
