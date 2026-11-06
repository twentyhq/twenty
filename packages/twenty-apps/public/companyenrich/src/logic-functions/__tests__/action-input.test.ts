import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as CompanyEnrichClient from '../utils/companyenrich-client';

const { query, enrich } = vi.hoisted(() => ({
  query: vi.fn(),
  enrich: vi.fn(),
}));
vi.mock('../utils/companyenrich-client', async (original) => ({
  ...(await original<typeof CompanyEnrichClient>()),
  queryCompanyEnrich: query,
}));
vi.mock('../utils/enrich-record', () => ({ enrichRecord: enrich }));

import specification from 'src/schemas/operations.json';
import { createResearchFunction } from '../utils/create-research-function';
import { createRecordFunction } from '../utils/create-record-function';
import { toResearchInput } from '../utils/to-action-input';

const memberContext = {
  retryCount: 0,
  maxRetries: 0,
  workspaceId: 'workspace',
  userWorkspaceId: 'user-workspace',
  workspaceMemberId: 'member',
};

const route = <T>(body: T) => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body,
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/companyenrich/test' } },
  userWorkspaceId: 'synthetic-user',
});

describe('action input adapters', () => {
  beforeEach(() => {
    query.mockReset();
    enrich.mockReset();
  });

  it.each(specification.operations)(
    '$name accepts HTTP envelopes and direct AI inputs',
    async (operation) => {
      const handler = createResearchFunction(operation.name).handler;
      await handler(route(operation.example), memberContext);
      await handler(operation.example, memberContext);
      expect(query).toHaveBeenNthCalledWith(
        1,
        operation.name,
        operation.example,
      );
      expect(query).toHaveBeenNthCalledWith(
        2,
        operation.name,
        operation.example,
      );
    },
  );

  it.each(['company', 'person'] as const)(
    'adapts %s record HTTP calls without changing workflow inputs',
    async (kind) => {
      const input = { recordId: 'record-id' };
      const handler = createRecordFunction(kind).handler;
      await handler(route(input), memberContext);
      await handler(input, memberContext);
      expect(enrich).toHaveBeenNthCalledWith(1, kind, input);
      expect(enrich).toHaveBeenNthCalledWith(2, kind, input);
    },
  );

  it('parses editable workflow JSON while preserving top-level query controls', async () => {
    await createResearchFunction('similar-companies').handler(
      {
        bodyJson: '{"domains":["example.com"],"page":2}',
        waitForEnrichment: false,
        expand: ['workforce'],
      },
      memberContext,
    );
    expect(query).toHaveBeenCalledWith('similar-companies', {
      body: { domains: ['example.com'], page: 2 },
      waitForEnrichment: false,
      expand: ['workforce'],
    });
  });

  it.each([
    undefined,
    { ...memberContext, userWorkspaceId: null, workspaceMemberId: null },
    { ...memberContext, workspaceMemberId: null },
  ])(
    'rejects record saves without a delegated member before any CRM or provider access',
    async (context) => {
      const response = await Reflect.apply(
        createRecordFunction('company').handler,
        undefined,
        [
          {
            ...route({ recordId: 'record-id', context: memberContext }),
            userWorkspaceId: 'forged-payload-user',
          },
          context,
        ],
      );
      expect(response).toMatchObject({
        success: false,
        error: expect.stringContaining('signed-in workspace member'),
      });
      expect(enrich).not.toHaveBeenCalled();
      expect(query).not.toHaveBeenCalled();
    },
  );

  it.each([false, 42, null])(
    'reports a non-string bodyJson as an input type error',
    async (bodyJson) => {
      expect(
        await createResearchFunction('search-companies').handler(
          { bodyJson },
          memberContext,
        ),
      ).toEqual({
        success: false,
        error: 'Request body JSON must be a string.',
      });
      expect(query).not.toHaveBeenCalled();
    },
  );

  it('does not confuse a direct provider body with an HTTP envelope', () => {
    expect(toResearchInput({ body: { domains: ['example.com'] } })).toEqual({
      body: { domains: ['example.com'] },
    });
  });

  it.each([
    { bodyJson: '{' },
    { bodyJson: '{}', body: {} },
    { bodyJson: ' '.repeat(256 * 1024 + 1) },
  ])(
    'rejects malformed or ambiguous workflow JSON before calling the provider',
    async (input) => {
      expect(
        await createResearchFunction('search-companies').handler(
          input,
          memberContext,
        ),
      ).toMatchObject({ success: false });
      expect(query).not.toHaveBeenCalled();
    },
  );
});
