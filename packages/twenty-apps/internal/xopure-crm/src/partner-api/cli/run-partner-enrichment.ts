import { fileURLToPath } from 'node:url';
import { createTwentyRestClient } from '../../supabase-sync/twenty-rest-client';
import { createPartnerApiClientFromEnv } from '../partner-api-client';
import {
  runPartnerEnrichment,
  type EndpointName,
  type PartnerEnrichmentResult,
} from '../run-partner-enrichment';

type Env = Record<string, string | undefined>;

type CliArgs = {
  dryRun: boolean;
  endpoints?: EndpointName[];
  delayMs?: number;
  maxRetries?: number;
};

type ExecuteCliDeps = {
  env?: Env;
};

const VALID_ENDPOINTS: EndpointName[] = ['orders', 'shipments', 'ambassadors'];

const firstNonEmpty = (...values: Array<string | undefined>): string | undefined => {
  for (const value of values) {
    if (value && value.trim().length > 0) return value.trim();
  }
  return undefined;
};

const SECRET_ENV_NAMES = [
  'XOPURE_PARTNER_API_KEY',
  'XOPURE_TWENTY_API_KEY',
  'TWENTY_API_KEY',
];

const parseArgs = (argv: string[]): CliArgs => {
  const args: CliArgs = { dryRun: true };

  for (const token of argv) {
    if (token === '--live') {
      args.dryRun = false;
      continue;
    }
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (token.startsWith('--endpoints=')) {
      const raw = token.slice('--endpoints='.length);
      const names = raw.split(',').map((s) => s.trim()).filter(Boolean);
      for (const name of names) {
        if (!VALID_ENDPOINTS.includes(name as EndpointName)) {
          throw new Error(`Invalid endpoint: ${name}. Valid: ${VALID_ENDPOINTS.join(', ')}`);
        }
      }
      args.endpoints = names as EndpointName[];
      continue;
    }
    if (token.startsWith('--delay=')) {
      const delayMs = Number(token.slice('--delay='.length));
      if (Number.isNaN(delayMs) || delayMs < 0) {
        throw new Error('--delay must be a non-negative number of milliseconds.');
      }
      args.delayMs = delayMs;
      continue;
    }
    if (token.startsWith('--retry=')) {
      const maxRetries = Number(token.slice('--retry='.length));
      if (Number.isNaN(maxRetries) || maxRetries < 0 || !Number.isInteger(maxRetries)) {
        throw new Error('--retry must be a non-negative integer.');
      }
      args.maxRetries = maxRetries;
      continue;
    }
    throw new Error(`Unsupported argument: ${token}`);
  }

  return args;
};

const resolveEnv = (env: Env) => {
  const twentyApiUrl = firstNonEmpty(env.XOPURE_TWENTY_API_URL, env.TWENTY_SERVER_URL);
  if (!twentyApiUrl) {
    throw new Error('Missing Twenty API URL. Set XOPURE_TWENTY_API_URL or TWENTY_SERVER_URL.');
  }
  const twentyApiKey = firstNonEmpty(env.XOPURE_TWENTY_API_KEY, env.TWENTY_API_KEY);
  if (!twentyApiKey) {
    throw new Error('Missing Twenty API key. Set XOPURE_TWENTY_API_KEY or TWENTY_API_KEY.');
  }
  const partnerBaseUrl = firstNonEmpty(env.XOPURE_API_BASE_URL);
  const partnerApiKey = firstNonEmpty(env.XOPURE_PARTNER_API_KEY);
  if (!partnerBaseUrl || !partnerApiKey) {
    throw new Error('Missing Partner API env. Set XOPURE_API_BASE_URL and XOPURE_PARTNER_API_KEY.');
  }
  return { twentyApiUrl, twentyApiKey, partnerBaseUrl, partnerApiKey };
};

const redactSecrets = (message: string, env: Env): string => {
  let redacted = message;
  for (const name of SECRET_ENV_NAMES) {
    const value = env[name]?.trim();
    if (value) redacted = redacted.split(value).join('[redacted]');
  }
  return redacted;
};

const formatResult = (result: PartnerEnrichmentResult): string => {
  const lines: string[] = [];
  lines.push(`Partner API Enrichment — ${result.dryRun ? 'DRY RUN' : 'LIVE'}`);
  lines.push(`Total duration: ${result.totalDurationMs}ms`);
  lines.push('');

  for (const ep of result.results) {
    lines.push(`  [${ep.endpoint}] scanned=${ep.scanned} enriched=${ep.enriched} skipped=${ep.skipped} failed=${ep.failed} (${ep.durationMs}ms)`);
    if (ep.watermark) lines.push(`    watermark: ${ep.watermark}`);
    for (const error of ep.errors.slice(0, 5)) {
      lines.push(`    error: ${error}`);
    }
    if (ep.errors.length > 5) lines.push(`    ... and ${ep.errors.length - 5} more errors`);
  }

  if (result.fulfillmentExceptions) {
    const fe = result.fulfillmentExceptions;
    lines.push('');
    lines.push(`Fulfillment exceptions (${fe.windowDays}d): ${fe.exceptionCount} exceptions, ${fe.unresolvedInboundEvents} unresolved inbound events`);
    for (const ex of fe.exceptions.slice(0, 10)) {
      lines.push(`  ${ex.orderShort} — ${ex.flag} (${ex.ageHours}h old) — ${ex.fulfillmentStatus ?? 'unknown'}`);
    }
    if (fe.exceptions.length > 10) lines.push(`  ... and ${fe.exceptions.length - 10} more`);
  }

  return lines.join('\n');
};

export const executePartnerEnrichmentCli = async (
  argv: string[],
  deps: ExecuteCliDeps = {},
): Promise<void> => {
  const env = deps.env ?? process.env;
  const args = parseArgs(argv);
  const resolvedEnv = resolveEnv(env);

  const twentyClient = createTwentyRestClient({
    apiUrl: resolvedEnv.twentyApiUrl,
    apiKey: resolvedEnv.twentyApiKey,
    requestDelayMs: args.delayMs ?? 700,
    maxRetries: args.maxRetries ?? 5,
  });

  const apiClient = createPartnerApiClientFromEnv(env, {
    requestDelayMs: args.delayMs ?? 500,
    maxRetries: args.maxRetries ?? 3,
  });

  const result = await runPartnerEnrichment({
    apiClient,
    twentyClient,
    endpoints: args.endpoints,
    dryRun: args.dryRun,
  });

  console.log(formatResult(result));

  const hasFailures = result.results.some((r) => r.failed > 0);
  if (hasFailures && !args.dryRun) {
    process.exitCode = 1;
  }
};

const isExecutedDirectly = (): boolean => {
  const url = import.meta.url;
  if (!url) return false;
  return process.argv[1] === fileURLToPath(url);
};

if (isExecutedDirectly()) {
  executePartnerEnrichmentCli(process.argv.slice(2)).catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(redactSecrets(message, process.env as Env));
    process.exitCode = 1;
  });
}
