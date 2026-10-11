import { isPlainObject } from 'twenty-shared/utils';
import { z } from 'zod';

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

const lambdaReportDurationSchema = z.number().nonnegative().transform(String);

export const parseLambdaLogResult = (
  logResult: string | undefined,
): ParsedLambdaLogResult => {
  if (!logResult) {
    return EMPTY_PARSED_LAMBDA_LOG_RESULT;
  }

  const decoded = Buffer.from(logResult, 'base64').toString('utf8');
  let reportMetrics: Record<string, unknown> | undefined;

  const applicationLogLines = decoded.split('\n').filter((line) => {
    let event: unknown;

    try {
      event = JSON.parse(line);
    } catch {
      return true;
    }

    if (!isPlainObject(event)) {
      return true;
    }

    if (
      event.type === 'platform.start' ||
      event.type === 'platform.runtimeDone'
    ) {
      return false;
    }

    if (
      event.type === 'platform.report' &&
      isPlainObject(event.record) &&
      isPlainObject(event.record.metrics)
    ) {
      reportMetrics = event.record.metrics;

      return false;
    }

    return true;
  });

  const initDurationMs =
    lambdaReportDurationSchema.safeParse(reportMetrics?.initDurationMs).data ??
    decoded.match(/Init Duration:\s*([\d.]+)\s*ms/i)?.[1] ??
    null;
  const billedDurationMs =
    lambdaReportDurationSchema.safeParse(reportMetrics?.billedDurationMs)
      .data ??
    decoded.match(/Billed Duration:\s*([\d.]+)\s*ms/i)?.[1] ??
    null;
  const reportDurationMs =
    lambdaReportDurationSchema.safeParse(reportMetrics?.durationMs).data ??
    decoded.match(/\bDuration:\s*([\d.]+)\s*ms/i)?.[1] ??
    null;

  const logs = applicationLogLines
    .join('\n')
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
