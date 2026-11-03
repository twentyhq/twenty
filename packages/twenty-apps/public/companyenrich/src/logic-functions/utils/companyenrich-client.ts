import { CompanyEnrichError } from './companyenrich-error';
import { isObject } from '@sniptt/guards';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import specification from 'src/schemas/operations.json';

export type ResearchInput = {
  query?: string;
  domain?: string;
  id?: string;
  expand?: string[];
  waitForEnrichment?: boolean;
  body?: Record<string, unknown>;
};

export type ResearchResult = {
  success: true;
  data: unknown;
  creditsConsumed?: number;
};

const MAX_RESPONSE_BYTES = 8 * 1024 * 1024;
const MAX_REQUEST_BYTES = 256 * 1024;
const REQUEST_TIMEOUT_MS = 50_000;
const validator = new Ajv({ strict: false });
addFormats(validator);

validator.addSchema(specification, 'companyenrich');

const validators = new Map(
  specification.operations.map((operation, index) => [
    operation.name,
    validator.compile({
      $ref: `companyenrich#/operations/${index}/inputSchema`,
    }),
  ]),
);

export const getOperation = (name: string) => {
  const operation = specification.operations.find((item) => item.name === name);

  if (!operation) {
    throw new CompanyEnrichError('Unknown CompanyEnrich operation.');
  }

  return operation;
};

export const parseProviderJson = (text: string): unknown =>
  JSON.parse(
    text,
    (_key: string, value: unknown, context?: { source?: string }) => {
      if (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        !Number.isSafeInteger(value)
      ) {
        if (!context?.source) {
          throw new CompanyEnrichError(
            'Exact large-integer parsing requires Node.js 24+.',
          );
        }

        return context.source;
      }

      return value;
    },
  );

const normalizeDomain = (value: string): string => {
  const domain = new URL(
    value.includes('://') ? value : `https://${value}`,
  ).hostname.toLowerCase();

  if (!domain.includes('.') || domain.length > 253) {
    throw new CompanyEnrichError('Enter a company domain such as example.com.');
  }

  return domain;
};

const validateInput = (name: string, input: ResearchInput): ResearchInput => {
  const validate = validators.get(name);

  if (!validate?.(input)) {
    const error = validate?.errors?.[0];

    throw new CompanyEnrichError(
      `Invalid CompanyEnrich input: ${error?.instancePath || '/'} ${error?.message || 'invalid value'}.`,
    );
  }

  const normalized = structuredClone(input);

  if (normalized.domain) {
    normalized.domain = normalizeDomain(normalized.domain);
  }

  if (name === 'company-workforce' && !normalized.id && !normalized.domain) {
    throw new CompanyEnrichError(
      'Provide a company ID or domain for workforce research.',
    );
  }

  if (
    ['get-person', 'person-education'].includes(name) &&
    BigInt(normalized.id!) > 9223372036854775807n
  ) {
    throw new CompanyEnrichError(
      'The person ID must fit in a signed 64-bit integer.',
    );
  }

  if (
    normalized.id &&
    !['get-person', 'person-education'].includes(name) &&
    !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(normalized.id)
  ) {
    throw new CompanyEnrichError('A CompanyEnrich company ID must be a UUID.');
  }

  if (normalized.body) {
    if (
      ['search-companies', 'similar-companies', 'search-people'].includes(name)
    ) {
      normalized.body.page ??= 1;
      normalized.body.pageSize ??= 10;
    }

    if (
      normalized.body.page !== undefined &&
      Number(normalized.body.page) < 1
    ) {
      throw new CompanyEnrichError('Page must be at least 1.');
    }

    if (typeof normalized.body.domain === 'string') {
      normalized.body.domain = normalizeDomain(normalized.body.domain);
    }

    if (Array.isArray(normalized.body.domains)) {
      normalized.body.domains = normalized.body.domains.map((domain) =>
        normalizeDomain(String(domain)),
      );
    }

    if (
      name === 'search-people' &&
      Array.isArray(normalized.body.domains) &&
      normalized.body.domains.length > 2500
    ) {
      throw new CompanyEnrichError(
        'People search supports at most 2,500 domains.',
      );
    }

    if (
      name.includes('similar') &&
      !normalized.body.domain &&
      !(
        Array.isArray(normalized.body.domains) && normalized.body.domains.length
      )
    ) {
      throw new CompanyEnrichError(
        'Provide at least one seed domain for similar-company research.',
      );
    }

    if (
      name === 'enrich-company-properties' &&
      !Object.values(normalized.body).some(
        (value) => typeof value === 'string' && value.trim(),
      )
    ) {
      throw new CompanyEnrichError(
        'Provide at least one company name or social identifier.',
      );
    }

    if (
      name === 'lookup-person' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(normalized.body.email))
    ) {
      throw new CompanyEnrichError(
        'Provide the known email address of the person to look up.',
      );
    }
  }

  if (
    new TextEncoder().encode(JSON.stringify(normalized)).byteLength >
    MAX_REQUEST_BYTES
  ) {
    throw new CompanyEnrichError('CompanyEnrich input exceeds 256 KiB.');
  }

  return normalized;
};

const readResponse = async (response: Response): Promise<string> => {
  if (!response.body) {
    throw new CompanyEnrichError('CompanyEnrich returned an empty response.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let result = '';

  try {
    while (true) {
      const chunk = await reader.read();

      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new CompanyEnrichError(
          'CompanyEnrich response exceeds 8 MiB. Reduce the page size.',
        );
      }
      result += decoder.decode(chunk.value, { stream: true });
    }

    return result + decoder.decode();
  } finally {
    reader.releaseLock();
  }
};

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Check the input against the CompanyEnrich API documentation.',
  401: 'Check the CompanyEnrich API key in the app settings.',
  402: 'Your CompanyEnrich account needs more credits.',
  404: 'No match was found. With waitForEnrichment=false, new domains may still be processing.',
  422: 'CompanyEnrich rejected the input. Check the API documentation.',
  429: 'CompanyEnrich rate limit reached. Wait before starting another request.',
};

export const queryCompanyEnrich = async (
  name: string,
  input: ResearchInput,
  fetchRequest: typeof fetch = fetch,
): Promise<ResearchResult> => {
  const operation = getOperation(name);
  const normalized = validateInput(name, input);
  const apiKey = process.env.COMPANYENRICH_API_KEY?.trim();

  if (!apiKey) {
    throw new CompanyEnrichError(
      'Set COMPANYENRICH_API_KEY in the CompanyEnrich app settings.',
    );
  }

  const url = new URL(operation.path, 'https://api.companyenrich.com');

  for (const [key, value] of Object.entries(normalized)) {
    if (key === 'body' || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      url.searchParams.append(key, String(item));
    }
  }

  let response: Response;

  try {
    response = await fetchRequest(url, {
      method: operation.method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        ...(operation.method === 'POST'
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
      body: normalized.body ? JSON.stringify(normalized.body) : undefined,
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new CompanyEnrichError(
      'CompanyEnrich request failed or timed out. It was not retried; check your account usage before trying again.',
    );
  }

  if (!response.ok) {
    await response.body?.cancel();
    throw new CompanyEnrichError(
      `CompanyEnrich (${response.status}): ${STATUS_MESSAGES[response.status] ?? 'The provider is unavailable. The request was not retried.'}`,
    );
  }

  let data: unknown;

  try {
    data = parseProviderJson(await readResponse(response));
  } catch {
    throw new CompanyEnrichError(
      'CompanyEnrich returned invalid or oversized JSON. The request was not retried.',
    );
  }

  const bodyCredits =
    isObject(data) && 'creditsConsumed' in data
      ? data.creditsConsumed
      : undefined;
  const headerCredits = response.headers.get('x-credit-cost');
  const cost =
    bodyCredits ?? (headerCredits === null ? undefined : Number(headerCredits));

  return {
    success: true,
    data,
    ...(typeof cost === 'number' && Number.isFinite(cost) && cost >= 0
      ? { creditsConsumed: cost }
      : {}),
  };
};
