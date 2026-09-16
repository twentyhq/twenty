import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveCompanyIds } from 'src/logic-functions/data/resolve-company-ids.util';

const buildClient = (
  query: ReturnType<typeof vi.fn>,
  mutation: ReturnType<typeof vi.fn> = vi.fn(),
): CoreApiClient => ({ query, mutation }) as unknown as CoreApiClient;

const buildCompanies = (nodes: Record<string, unknown>[]) => ({
  companies: { edges: nodes.map((node) => ({ node })) },
});

const NO_COMPANIES = buildCompanies([]);

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('resolveCompanyIds', () => {
  it('should match a company on its domain', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCompanies([
          { id: 'c1', domainName: { primaryLinkUrl: 'https://acme.com' } },
        ]),
      )
      .mockResolvedValue(NO_COMPANIES);

    const companyIds = await resolveCompanyIds({
      client: buildClient(query),
      organizations: [{ name: 'Acme', domain: 'acme.com' }],
    });

    expect(companyIds.get('domain:acme.com')).toBe('c1');
  });

  it('should match a domain however the stored url is written', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCompanies([
          {
            id: 'c1',
            domainName: { primaryLinkUrl: 'http://www.acme.com/careers' },
          },
        ]),
      )
      .mockResolvedValue(NO_COMPANIES);

    const companyIds = await resolveCompanyIds({
      client: buildClient(query),
      organizations: [{ domain: 'acme.com' }],
    });

    expect(companyIds.get('domain:acme.com')).toBe('c1');
  });

  it('should not match a domain that merely contains the searched one', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCompanies([
          { id: 'c1', domainName: { primaryLinkUrl: 'https://notacme.com' } },
        ]),
      )
      .mockResolvedValue(NO_COMPANIES);
    const mutation = vi.fn().mockResolvedValue({
      createCompanies: [
        { id: 'c2', domainName: { primaryLinkUrl: 'https://acme.com' } },
      ],
    });

    const companyIds = await resolveCompanyIds({
      client: buildClient(query, mutation),
      organizations: [{ name: 'Acme', domain: 'acme.com' }],
    });

    expect(companyIds.get('domain:acme.com')).toBe('c2');
  });

  it('should fall back to the name when the contact has no domain', async () => {
    const query = vi
      .fn()
      .mockResolvedValue(buildCompanies([{ id: 'c1', name: 'ACME' }]));

    const companyIds = await resolveCompanyIds({
      client: buildClient(query),
      organizations: [{ name: 'Acme' }],
    });

    expect(companyIds.get('name:acme')).toBe('c1');
  });

  it('should prefer the domain match over the name match', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCompanies([
          {
            id: 'by-domain',
            domainName: { primaryLinkUrl: 'https://acme.com' },
          },
        ]),
      )
      .mockResolvedValue(buildCompanies([{ id: 'by-name', name: 'Acme' }]));

    const companyIds = await resolveCompanyIds({
      client: buildClient(query),
      organizations: [{ name: 'Acme', domain: 'acme.com' }],
    });

    expect(companyIds.get('domain:acme.com')).toBe('by-domain');
  });

  it('should create a missing company with its domain', async () => {
    const query = vi.fn().mockResolvedValue(NO_COMPANIES);
    const mutation = vi.fn().mockResolvedValue({
      createCompanies: [
        {
          id: 'c1',
          name: 'Acme',
          domainName: { primaryLinkUrl: 'https://acme.com' },
        },
      ],
    });

    const companyIds = await resolveCompanyIds({
      client: buildClient(query, mutation),
      organizations: [{ name: 'Acme', domain: 'acme.com' }],
    });

    expect(mutation.mock.calls[0][0].createCompanies.__args.data).toEqual([
      { name: 'Acme', domainName: { primaryLinkUrl: 'https://acme.com' } },
    ]);
    expect(companyIds.get('domain:acme.com')).toBe('c1');
  });

  it('should not invent a company for an organization with no name', async () => {
    const query = vi.fn().mockResolvedValue(NO_COMPANIES);
    const mutation = vi.fn();

    const companyIds = await resolveCompanyIds({
      client: buildClient(query, mutation),
      organizations: [{ domain: 'acme.com' }],
    });

    expect(companyIds.size).toBe(0);
    expect(mutation).not.toHaveBeenCalled();
  });

  it('should resolve one company for organizations sharing a domain', async () => {
    const query = vi.fn().mockResolvedValue(NO_COMPANIES);
    const mutation = vi.fn().mockResolvedValue({
      createCompanies: [
        {
          id: 'c1',
          name: 'Acme',
          domainName: { primaryLinkUrl: 'https://acme.com' },
        },
      ],
    });

    await resolveCompanyIds({
      client: buildClient(query, mutation),
      organizations: [
        { name: 'Acme', domain: 'acme.com' },
        { name: 'Acme Corp', domain: 'www.ACME.com' },
      ],
    });

    expect(mutation.mock.calls[0][0].createCompanies.__args.data).toHaveLength(
      1,
    );
  });

  it('should register a company found by domain under its name too', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCompanies([
          {
            id: 'c1',
            name: 'Acme',
            domainName: { primaryLinkUrl: 'https://acme.com' },
          },
        ]),
      )
      .mockResolvedValue(NO_COMPANIES);

    const companyIds = await resolveCompanyIds({
      client: buildClient(query),
      organizations: [{ name: 'Acme', domain: 'acme.com' }],
    });

    expect(companyIds.get('domain:acme.com')).toBe('c1');
    expect(companyIds.get('name:acme')).toBe('c1');
  });

  it('should reuse a company matched on name when the contact carries a domain', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(NO_COMPANIES)
      .mockResolvedValue(buildCompanies([{ id: 'c1', name: 'Acme' }]));
    const mutation = vi.fn();

    const companyIds = await resolveCompanyIds({
      client: buildClient(query, mutation),
      organizations: [{ name: 'Acme', domain: 'acme.com' }],
    });

    expect(mutation).not.toHaveBeenCalled();
    expect(companyIds.get('domain:acme.com')).toBe('c1');
  });

  it('should create one company for a named organization and a domainless one sharing that name', async () => {
    const query = vi.fn().mockResolvedValue(NO_COMPANIES);
    const mutation = vi.fn().mockResolvedValue({
      createCompanies: [
        {
          id: 'c1',
          name: 'Acme',
          domainName: { primaryLinkUrl: 'https://acme.com' },
        },
      ],
    });

    const companyIds = await resolveCompanyIds({
      client: buildClient(query, mutation),
      organizations: [{ name: 'Acme', domain: 'acme.com' }, { name: 'Acme' }],
    });

    expect(mutation.mock.calls[0][0].createCompanies.__args.data).toHaveLength(
      1,
    );
    expect(companyIds.get('domain:acme.com')).toBe('c1');
    expect(companyIds.get('name:acme')).toBe('c1');
  });

  it('should keep creating the others when one company cannot be created', async () => {
    const query = vi.fn().mockResolvedValue(NO_COMPANIES);
    const mutation = vi
      .fn()
      .mockRejectedValueOnce(new Error('duplicate key value'))
      .mockRejectedValueOnce(new Error('duplicate key value'))
      .mockResolvedValue({ createCompanies: [{ id: 'c2', name: 'Globex' }] });

    const companyIds = await resolveCompanyIds({
      client: buildClient(query, mutation),
      organizations: [{ name: 'Acme' }, { name: 'Globex' }],
    });

    expect(companyIds.get('name:acme')).toBeUndefined();
    expect(companyIds.get('name:globex')).toBe('c2');
  });

  it('should escape ilike wildcards in a company name', async () => {
    const query = vi.fn().mockResolvedValue(NO_COMPANIES);

    await resolveCompanyIds({
      client: buildClient(query, vi.fn().mockResolvedValue({})),
      organizations: [{ name: '50%_off' }],
    });

    expect(query.mock.calls[0][0].companies.__args.filter.or).toEqual([
      { name: { ilike: '50\\%\\_off' } },
    ]);
  });

  it('should make no call when no contact carries an employer', async () => {
    const query = vi.fn();
    const mutation = vi.fn();

    const companyIds = await resolveCompanyIds({
      client: buildClient(query, mutation),
      organizations: [],
    });

    expect(companyIds.size).toBe(0);
    expect(query).not.toHaveBeenCalled();
    expect(mutation).not.toHaveBeenCalled();
  });
});
