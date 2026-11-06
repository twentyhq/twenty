import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import specification from 'src/schemas/operations.json';
import { CompanyEnrichError } from '../utils/companyenrich-error';
import {
  parseProviderJson,
  queryCompanyEnrich,
  type ResearchInput,
} from '../utils/companyenrich-client';

describe('CompanyEnrich requests', () => {
  beforeEach(() => vi.stubEnv('COMPANYENRICH_API_KEY', 'synthetic-test-key'));
  afterEach(() => vi.unstubAllEnvs());

  it.each(specification.operations)(
    '$name uses its documented method, fixed endpoint, and query/body separation',
    async (operation) => {
      const fetchRequest = vi.fn<typeof fetch>().mockResolvedValue(
        new Response('{"items":[],"total":0}', {
          headers: { 'x-credit-cost': '0' },
        }),
      );
      const input = structuredClone(operation.example) as ResearchInput;
      const result = await queryCompanyEnrich(
        operation.name,
        input,
        fetchRequest,
      );
      const [url, request] = fetchRequest.mock.calls[0];

      const requestUrl = new URL(String(url));
      expect(`${requestUrl.origin}${requestUrl.pathname}`).toBe(
        `https://api.companyenrich.com${operation.path}`,
      );
      for (const [key, value] of Object.entries(input)) {
        if (key === 'body' || value === undefined) continue;
        expect(requestUrl.searchParams.getAll(key)).toEqual(
          (Array.isArray(value) ? value : [value]).map(String),
        );
      }
      expect(request?.method).toBe(operation.method);
      expect(request?.redirect).toBe('error');
      expect(request?.signal).toBeInstanceOf(AbortSignal);
      expect(request?.headers).toMatchObject({
        Authorization: 'Bearer synthetic-test-key',
      });
      expect(
        request?.body ? JSON.parse(String(request.body)) : undefined,
      ).toEqual(input.body);
      expect(result).toEqual({
        success: true,
        data: { items: [], total: 0 },
        creditsConsumed: 0,
      });
      expect(fetchRequest).toHaveBeenCalledTimes(1);
    },
  );

  it('preserves explicit false and applies expansions as query parameters', async () => {
    const fetchRequest = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('{}'));
    await queryCompanyEnrich(
      'similar-companies',
      {
        body: { domains: ['https://EXAMPLE.com/about'] },
        waitForEnrichment: false,
        expand: ['workforce'],
      },
      fetchRequest,
    );
    const [url, request] = fetchRequest.mock.calls[0];
    expect(new URL(String(url)).searchParams.get('waitForEnrichment')).toBe(
      'false',
    );
    expect(new URL(String(url)).searchParams.getAll('expand')).toEqual([
      'workforce',
    ]);
    expect(JSON.parse(String(request?.body))).toEqual({
      domains: ['example.com'],
      page: 1,
      pageSize: 10,
    });
  });

  it.each([
    ['enrich-company', { domain: 'https://[' }],
    ['similar-companies', { body: { domain: 'https://[' } }],
  ] as const)(
    'reports malformed %s domains before calling the provider',
    async (name, input) => {
      const fetchRequest = vi.fn<typeof fetch>();
      const error = await queryCompanyEnrich(name, input, fetchRequest).catch(
        (caught: Error) => caught,
      );
      expect(error).toBeInstanceOf(CompanyEnrichError);
      expect((error as Error).message).toBe(
        'Enter a company domain such as example.com.',
      );
      expect(fetchRequest).not.toHaveBeenCalled();
    },
  );

  it('normalizes the supported singular similarity domain', async () => {
    const fetchRequest = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('{}'));
    await queryCompanyEnrich(
      'similar-companies',
      { body: { domain: 'https://EXAMPLE.com/about' } },
      fetchRequest,
    );
    expect(JSON.parse(String(fetchRequest.mock.calls[0][1]?.body)).domain).toBe(
      'example.com',
    );
  });

  it('retains unsafe integer IDs exactly, including nested IDs', async () => {
    const fetchRequest = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(
          '{"id":9223372036854775806,"nested":[{"id":9007199254740993}],"score":0.75}',
        ),
      );
    const result = await queryCompanyEnrich(
      'get-person',
      { id: '9223372036854775806' },
      fetchRequest,
    );
    expect(result.data).toEqual({
      id: '9223372036854775806',
      nested: [{ id: '9007199254740993' }],
      score: 0.75,
    });
    expect(String(fetchRequest.mock.calls[0][0])).toContain(
      'id=9223372036854775806',
    );
  });

  it('preserves numeric zero and batch arrays', async () => {
    const fetchRequest = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('0'))
      .mockResolvedValueOnce(new Response('[{"id":"one"},{"id":"two"}]'));
    expect(
      (await queryCompanyEnrich('count-companies', { body: {} }, fetchRequest))
        .data,
    ).toBe(0);
    expect(
      (
        await queryCompanyEnrich(
          'enrich-companies-batch',
          { body: { domains: ['one.example', 'two.example'] } },
          fetchRequest,
        )
      ).data,
    ).toEqual([{ id: 'one' }, { id: 'two' }]);
  });

  it('preserves body credit metadata over a fallback header', async () => {
    const fetchRequest = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('{"creditsConsumed":0,"items":[],"total":0}', {
        headers: { 'x-credit-cost': '3' },
      }),
    );
    expect(
      (await queryCompanyEnrich('search-companies', { body: {} }, fetchRequest))
        .creditsConsumed,
    ).toBe(0);
  });

  it.each([
    ['enrich-companies-batch', { body: { domains: [] } }],
    [
      'enrich-companies-batch',
      { body: { domains: Array(51).fill('example.com') } },
    ],
    ['search-companies', { body: { pageSize: 101 } }],
    ['search-companies', { body: { page: 0 } }],
    ['search-people', { body: { positionQuery: 'engineer' } }],
    ['search-people', { body: { inventedFilter: 'x' } }],
    [
      'search-people',
      {
        body: {
          companyFilter: {
            similar: { domains: ['example.com'], workforceSize: ['invalid'] },
          },
        },
      },
    ],
    ['search-people', { body: { atCurrentCompanyAfter: 'not-a-date' } }],
    ['search-companies', { body: { lists: ['not-a-uuid'] } }],
    ['search-companies', { body: { states: [2147483648] } }],
    ['enrich-company-properties', { body: { linkedinUrl: 'not a URI' } }],
    ['company-workforce', {}],
    ['similar-companies', { body: {} }],
    ['enrich-company-properties', { body: {} }],
    ['lookup-person', { body: { email: 'not-an-email' } }],
    ['get-company', { id: 'not-a-uuid' }],
    ['get-person', { id: 9007199254740992 }],
    ['get-person', { id: '9223372036854775808' }],
    ['enrich-company', { domain: 'example.com', expand: ['education'] }],
  ])('rejects invalid %s input before a paid request', async (name, input) => {
    const fetchRequest = vi.fn<typeof fetch>();
    await expect(
      queryCompanyEnrich(name as string, input as ResearchInput, fetchRequest),
    ).rejects.toThrow();
    expect(fetchRequest).not.toHaveBeenCalled();
  });

  it('does not call the provider without credentials', async () => {
    vi.stubEnv('COMPANYENRICH_API_KEY', '');
    const fetchRequest = vi.fn<typeof fetch>();
    await expect(
      queryCompanyEnrich(
        'enrich-company',
        { domain: 'example.com' },
        fetchRequest,
      ),
    ).rejects.toThrow('app settings');
    expect(fetchRequest).not.toHaveBeenCalled();
  });

  it.each([401, 402, 404, 422, 429, 503])(
    'reports HTTP %s without leaking raw errors or retrying',
    async (status) => {
      const fetchRequest = vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response('provider-secret-and-private-details', { status }),
        );
      const error = await queryCompanyEnrich(
        'enrich-company',
        { domain: 'example.com' },
        fetchRequest,
      ).catch((caught: Error) => caught);
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain(`(${status})`);
      expect((error as Error).message).not.toContain(
        'provider-secret-and-private-details',
      );
      expect(fetchRequest).toHaveBeenCalledTimes(1);
    },
  );

  it('does not echo a failed request or retry ambiguous network failures', async () => {
    const fetchRequest = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error('Authorization: private-key'));
    const error = await queryCompanyEnrich(
      'enrich-company',
      { domain: 'example.com' },
      fetchRequest,
    ).catch((caught: Error) => caught);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('not retried');
    expect((error as Error).message).not.toContain(
      'Authorization: private-key',
    );
    expect(fetchRequest).toHaveBeenCalledTimes(1);
  });

  it.each([
    'not JSON',
    JSON.stringify({ payload: 'x'.repeat(8 * 1024 * 1024) }),
  ])('rejects invalid or oversized responses', async (responseBody) => {
    const fetchRequest = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(responseBody));
    await expect(
      queryCompanyEnrich(
        'enrich-company',
        { domain: 'example.com' },
        fetchRequest,
      ),
    ).rejects.toThrow('invalid or oversized');
  });

  it('does not convert text, booleans, or ordinary numbers during parsing', () => {
    expect(
      parseProviderJson(
        '{"text":"9223372036854775806","enabled":false,"number":42,"nullable":null}',
      ),
    ).toEqual({
      text: '9223372036854775806',
      enabled: false,
      number: 42,
      nullable: null,
    });
  });
});
