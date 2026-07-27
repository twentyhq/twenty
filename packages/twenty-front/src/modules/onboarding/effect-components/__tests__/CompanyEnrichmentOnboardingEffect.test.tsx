import { MockedProvider } from '@apollo/client/testing/react';
import { act, render } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { Provider as JotaiProvider } from 'jotai';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { CompanyEnrichmentOnboardingEffect } from '@/onboarding/effect-components/CompanyEnrichmentOnboardingEffect';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { hasAttemptedCompanyEnrichmentFetchState } from '@/onboarding/states/hasAttemptedCompanyEnrichmentFetchState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  EnrichWorkspaceCompanyDocument,
  OnboardingStatus,
} from '~/generated-metadata/graphql';

const mockOnboardingStatus = jest.fn();

jest.mock('@/onboarding/hooks/useOnboardingStatus', () => ({
  useOnboardingStatus: () => mockOnboardingStatus(),
}));

const enrichment: WorkspaceCompanyEnrichment = {
  domain: 'acme.com',
  enrichedAt: '2026-07-21T10:00:00.000Z',
  name: 'Acme Inc',
  website: null,
  industry: null,
  employeeCount: null,
  size: null,
  founded: null,
  headline: null,
  summary: null,
  tags: [],
  locality: null,
  region: null,
  country: null,
};

const buildEnrichMock = ({
  outcome,
  enrichmentPayload,
  countCall,
}: {
  outcome: string;
  enrichmentPayload: WorkspaceCompanyEnrichment | null;
  countCall: () => void;
}) => ({
  request: { query: EnrichWorkspaceCompanyDocument },
  result: () => {
    countCall();

    return {
      data: {
        enrichWorkspaceCompany: {
          __typename: 'WorkspaceCompanyEnrichmentResult',
          outcome,
          enrichment: enrichmentPayload,
        },
      },
    };
  },
});

const renderEffect = (mocks: readonly unknown[]) =>
  render(
    <MockedProvider mocks={mocks as never}>
      <JotaiProvider store={jotaiStore}>
        <CompanyEnrichmentOnboardingEffect />
      </JotaiProvider>
    </MockedProvider>,
  );

const flushMutation = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
};

describe('CompanyEnrichmentOnboardingEffect', () => {
  beforeEach(() => {
    resetJotaiStore();
    localStorage.clear();
    mockOnboardingStatus.mockReturnValue(OnboardingStatus.PROFILE_CREATION);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches once during onboarding and stores a matched enrichment', async () => {
    let callCount = 0;
    const { rerender } = renderEffect([
      {
        ...buildEnrichMock({
          outcome: 'matched',
          enrichmentPayload: enrichment,
          countCall: () => {
            callCount += 1;
          },
        }),
        maxUsageCount: 2,
      },
    ]);

    await flushMutation();

    rerender(
      <MockedProvider mocks={[] as never}>
        <JotaiProvider store={jotaiStore}>
          <CompanyEnrichmentOnboardingEffect />
        </JotaiProvider>
      </MockedProvider>,
    );
    await flushMutation();

    expect(callCount).toBe(1);
    expect(jotaiStore.get(companyEnrichmentState.atom)).toMatchObject({
      domain: 'acme.com',
      name: 'Acme Inc',
    });
    expect(jotaiStore.get(hasAttemptedCompanyEnrichmentFetchState.atom)).toBe(
      true,
    );
  });

  it.each([OnboardingStatus.COMPLETED, OnboardingStatus.WORKSPACE_ACTIVATION])(
    'does not fetch when the onboarding status is %s',
    async (status) => {
      mockOnboardingStatus.mockReturnValue(status);

      let callCount = 0;
      renderEffect([
        buildEnrichMock({
          outcome: 'matched',
          enrichmentPayload: enrichment,
          countCall: () => {
            callCount += 1;
          },
        }),
      ]);

      await flushMutation();

      expect(callCount).toBe(0);
      expect(jotaiStore.get(companyEnrichmentState.atom)).toBeNull();
    },
  );

  it('does not fetch when an enrichment is already stored', async () => {
    jotaiStore.set(companyEnrichmentState.atom, enrichment);

    let callCount = 0;
    renderEffect([
      buildEnrichMock({
        outcome: 'matched',
        enrichmentPayload: enrichment,
        countCall: () => {
          callCount += 1;
        },
      }),
    ]);

    await flushMutation();

    expect(callCount).toBe(0);
  });

  it.each(['transientError', 'unavailable'])(
    'stores nothing on a %s outcome',
    async (outcome) => {
      let callCount = 0;
      renderEffect([
        buildEnrichMock({
          outcome,
          enrichmentPayload: null,
          countCall: () => {
            callCount += 1;
          },
        }),
      ]);

      await flushMutation();

      expect(callCount).toBe(1);
      expect(jotaiStore.get(companyEnrichmentState.atom)).toBeNull();
      expect(jotaiStore.get(hasAttemptedCompanyEnrichmentFetchState.atom)).toBe(
        true,
      );
    },
  );

  it('stores nothing when the mutation fails', async () => {
    renderEffect([
      {
        request: { query: EnrichWorkspaceCompanyDocument },
        result: { errors: [new GraphQLError('Internal server error')] },
      },
    ]);

    await flushMutation();

    expect(jotaiStore.get(companyEnrichmentState.atom)).toBeNull();
    expect(jotaiStore.get(hasAttemptedCompanyEnrichmentFetchState.atom)).toBe(
      true,
    );
  });
});
