import { isObject } from '@sniptt/guards';
import { type RoutePayload } from 'twenty-sdk/define';

import { type ResearchInput } from './companyenrich-client';
import { CompanyEnrichError } from './companyenrich-error';

export type ActionInput<T> = T | RoutePayload<T>;

export const toActionInput = <T>(input: ActionInput<T>): T =>
  isObject(input) && 'requestContext' in input
    ? ((input as RoutePayload<T>).body ?? ({} as T))
    : (input as T);

export type ResearchActionInput = ResearchInput & { bodyJson?: string };

export const toResearchInput = (
  event: ActionInput<ResearchActionInput>,
): ResearchInput => {
  const input = toActionInput(event);
  if (!input || input.bodyJson === undefined) return input;
  if (typeof input.bodyJson !== 'string') {
    throw new CompanyEnrichError('Request body JSON must be a string.');
  }
  if (input.body !== undefined) {
    throw new CompanyEnrichError('Provide either body or bodyJson, not both.');
  }
  if (new TextEncoder().encode(input.bodyJson).byteLength > 256 * 1024) {
    throw new CompanyEnrichError('CompanyEnrich input exceeds 256 KiB.');
  }
  const { bodyJson, ...fields } = input;
  try {
    return { ...fields, body: JSON.parse(bodyJson) };
  } catch {
    throw new CompanyEnrichError('Enter a valid JSON request body.');
  }
};
