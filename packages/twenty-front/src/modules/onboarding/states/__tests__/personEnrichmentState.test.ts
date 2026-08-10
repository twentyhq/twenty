const loadPersonEnrichmentState = async () => {
  jest.resetModules();

  const { personEnrichmentState } =
    await import('@/onboarding/states/personEnrichmentState');
  const { createStore } = await import('jotai');

  return createStore().get(personEnrichmentState.atom);
};

describe('personEnrichmentState localStorage hydration', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('hydrates a stored enrichment with an email', async () => {
    localStorage.setItem(
      'personEnrichmentState',
      JSON.stringify({ email: 'ada@acme.com', jobTitle: 'Head of Sales' }),
    );

    await expect(loadPersonEnrichmentState()).resolves.toMatchObject({
      email: 'ada@acme.com',
      jobTitle: 'Head of Sales',
    });
  });

  it.each([
    {},
    42,
    'ada@acme.com',
    { email: '' },
    {
      fetchedAt: '2026-07-21T10:00:00.000Z',
      enrichment: { email: 'ada@acme.com' },
    },
  ])('falls back to null for the invalid payload %p', async (payload) => {
    localStorage.setItem('personEnrichmentState', JSON.stringify(payload));

    await expect(loadPersonEnrichmentState()).resolves.toBeNull();
  });
});
