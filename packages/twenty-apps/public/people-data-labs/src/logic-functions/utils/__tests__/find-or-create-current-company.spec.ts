import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { findOrCreateCurrentCompany } from 'src/logic-functions/utils/find-or-create-current-company';
import { type PdlPersonData } from 'src/types/pdl-person-data';

type CompanyQueryRequest = {
  companies: { __args: { filter: Record<string, unknown> } };
};
type CreateCompanyRequest = {
  createCompany: { __args: { data: Record<string, unknown> } };
};

const filterOf = (request: unknown) =>
  (request as CompanyQueryRequest).companies.__args.filter;
const createDataOf = (request: unknown) =>
  (request as CreateCompanyRequest).createCompany.__args.data;

const newCache = () => new Map<string, string | undefined>();

describe('findOrCreateCurrentCompany', () => {
  it('returns undefined and issues no calls when PDL gives no identifiers', async () => {
    const query = vi.fn();
    const mutation = vi.fn();
    const client = { query, mutation } as unknown as CoreApiClient;

    const result = await findOrCreateCurrentCompany({
      client,
      personData: {} as PdlPersonData,
      companyIdByMatchKeyCache: newCache(),
    });

    expect(result).toBeUndefined();
    expect(query).not.toHaveBeenCalled();
    expect(mutation).not.toHaveBeenCalled();
  });

  it('links an existing company matched by pdlId alone', async () => {
    const query = vi.fn(() =>
      Promise.resolve({ companies: { edges: [{ node: { id: 'co-existing' } }] } }),
    );
    const mutation = vi.fn();
    const client = { query, mutation } as unknown as CoreApiClient;

    const result = await findOrCreateCurrentCompany({
      client,
      personData: { job_company_id: 'pdl-co-1' } as PdlPersonData,
      companyIdByMatchKeyCache: newCache(),
    });

    expect(result).toBe('co-existing');
    expect(mutation).not.toHaveBeenCalled();
  });

  it('attempts a pdlId match but does not create without a name or website', async () => {
    const query = vi.fn(() => Promise.resolve({ companies: { edges: [] } }));
    const mutation = vi.fn();
    const client = { query, mutation } as unknown as CoreApiClient;

    const result = await findOrCreateCurrentCompany({
      client,
      personData: { job_company_id: 'pdl-co-1' } as PdlPersonData,
      companyIdByMatchKeyCache: newCache(),
    });

    expect(result).toBeUndefined();
    expect(query).toHaveBeenCalled();
    expect(mutation).not.toHaveBeenCalled();
  });

  it('returns an existing company id without creating one', async () => {
    const query = vi.fn(() =>
      Promise.resolve({ companies: { edges: [{ node: { id: 'co-existing' } }] } }),
    );
    const mutation = vi.fn();
    const client = { query, mutation } as unknown as CoreApiClient;

    const result = await findOrCreateCurrentCompany({
      client,
      personData: {
        job_company_name: 'Acme',
      } as PdlPersonData,
      companyIdByMatchKeyCache: newCache(),
    });

    expect(result).toBe('co-existing');
    expect(mutation).not.toHaveBeenCalled();
  });

  it('creates a company from the PDL data when none matches', async () => {
    const query = vi.fn(() => Promise.resolve({ companies: { edges: [] } }));
    let createdData: Record<string, unknown> | undefined;
    const mutation = vi.fn((request: unknown) => {
      createdData = createDataOf(request);

      return Promise.resolve({ createCompany: { id: 'co-new' } });
    });
    const client = { query, mutation } as unknown as CoreApiClient;

    const result = await findOrCreateCurrentCompany({
      client,
      personData: {
        job_company_id: 'pdl-co-2',
        job_company_name: 'Acme',
        job_company_website: 'acme.com',
      } as PdlPersonData,
      companyIdByMatchKeyCache: newCache(),
    });

    expect(result).toBe('co-new');
    expect(createdData).toMatchObject({ name: 'Acme', pdlId: 'pdl-co-2' });
  });

  it('throws when the create mutation returns no company id', async () => {
    const query = vi.fn(() => Promise.resolve({ companies: { edges: [] } }));
    const mutation = vi.fn(() => Promise.resolve({ createCompany: null }));
    const client = { query, mutation } as unknown as CoreApiClient;

    await expect(
      findOrCreateCurrentCompany({
        client,
        personData: {
          job_company_name: 'Acme',
        } as PdlPersonData,
        companyIdByMatchKeyCache: newCache(),
      }),
    ).rejects.toThrow('Failed to create company: no id returned.');
  });

  it('re-finds the winner when a concurrent create hits a unique violation', async () => {
    let created = false;
    const query = vi.fn((request: unknown) =>
      Promise.resolve(
        created && 'pdlId' in filterOf(request)
          ? { companies: { edges: [{ node: { id: 'co-race' } }] } }
          : { companies: { edges: [] } },
      ),
    );
    const mutation = vi.fn(() => {
      created = true;

      return Promise.reject(
        new Error('duplicate key value violates unique constraint'),
      );
    });
    const client = { query, mutation } as unknown as CoreApiClient;

    const result = await findOrCreateCurrentCompany({
      client,
      personData: {
        job_company_id: 'pdl-co-3',
        job_company_name: 'Acme',
      } as PdlPersonData,
      companyIdByMatchKeyCache: newCache(),
    });

    expect(result).toBe('co-race');
  });

  it('rethrows a non-unique-violation create error', async () => {
    const query = vi.fn(() => Promise.resolve({ companies: { edges: [] } }));
    const mutation = vi.fn(() => Promise.reject(new Error('network down')));
    const client = { query, mutation } as unknown as CoreApiClient;

    await expect(
      findOrCreateCurrentCompany({
        client,
        personData: {
          job_company_name: 'Acme',
        } as PdlPersonData,
        companyIdByMatchKeyCache: newCache(),
      }),
    ).rejects.toThrow('network down');
  });

  it('reuses a cached company id for an identical company without re-querying', async () => {
    const query = vi.fn(() =>
      Promise.resolve({ companies: { edges: [{ node: { id: 'co-existing' } }] } }),
    );
    const mutation = vi.fn();
    const client = { query, mutation } as unknown as CoreApiClient;
    const companyIdByMatchKeyCache = newCache();
    const personData = {
      job_company_name: 'Acme',
      job_company_website: 'acme.com',
    } as PdlPersonData;

    const first = await findOrCreateCurrentCompany({
      client,
      personData,
      companyIdByMatchKeyCache,
    });
    const second = await findOrCreateCurrentCompany({
      client,
      personData,
      companyIdByMatchKeyCache,
    });

    expect(first).toBe('co-existing');
    expect(second).toBe('co-existing');
    expect(query).toHaveBeenCalledTimes(1);
  });
});
