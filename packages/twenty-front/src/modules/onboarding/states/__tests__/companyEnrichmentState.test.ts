const loadCompanyEnrichmentState = async () => {
  jest.resetModules();

  const { companyEnrichmentState } =
    await import('@/onboarding/states/companyEnrichmentState');
  const { createStore } = await import('jotai');

  return createStore().get(companyEnrichmentState.atom);
};

describe('companyEnrichmentState localStorage hydration', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('hydrates a stored enrichment with a domain', async () => {
    localStorage.setItem(
      'companyEnrichmentState',
      JSON.stringify({ domain: 'acme.com', name: 'Acme Inc' }),
    );

    await expect(loadCompanyEnrichmentState()).resolves.toMatchObject({
      domain: 'acme.com',
      name: 'Acme Inc',
    });
  });

  it.each([
    {},
    42,
    'acme.com',
    { domain: '' },
    {
      fetchedAt: '2026-07-21T10:00:00.000Z',
      enrichment: { domain: 'acme.com' },
    },
  ])('falls back to null for the invalid payload %p', async (payload) => {
    localStorage.setItem('companyEnrichmentState', JSON.stringify(payload));

    await expect(loadCompanyEnrichmentState()).resolves.toBeNull();
  });
});
