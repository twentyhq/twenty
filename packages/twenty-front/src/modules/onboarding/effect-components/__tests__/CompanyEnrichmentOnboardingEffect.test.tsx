import { MockedProvider } from '@apollo/client/testing/react';
import { act, render } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { Provider as JotaiProvider } from 'jotai';
import {
  type WorkspaceCompanyEnrichment,
  type WorkspacePersonEnrichment,
} from 'twenty-shared/workspace';

import { currentUserState } from '@/auth/states/currentUserState';
import { isCompanyEnrichmentEnabledState } from '@/client-config/states/isCompanyEnrichmentEnabledState';
import { CompanyEnrichmentOnboardingEffect } from '@/onboarding/effect-components/CompanyEnrichmentOnboardingEffect';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { hasAttemptedCompanyEnrichmentFetchState } from '@/onboarding/states/hasAttemptedCompanyEnrichmentFetchState';
import { personEnrichmentState } from '@/onboarding/states/personEnrichmentState';
import { getIsBookCallOnboardingStepPending } from '@/onboarding/utils/getIsBookCallOnboardingStepPending';
import { waitForCompanyEnrichmentSettlement } from '@/onboarding/utils/waitForCompanyEnrichmentSettlement';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  CompleteBookCallOnboardingStepDocument,
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

const personEnrichment: WorkspacePersonEnrichment = {
  email: 'ada@acme.com',
  enrichedAt: '2026-07-21T10:00:00.000Z',
  fullName: 'Ada Lovelace',
  jobTitle: 'Head of Sales',
  jobTitleLevels: [],
  jobCompanyName: null,
  industry: null,
  headline: null,
  linkedinUrl: null,
  skills: [],
  locality: null,
  region: null,
  country: null,
};

const buildEnrichMock = ({
  outcome,
  enrichmentPayload,
  countCall,
  isBookCallOnboardingStepPending = false,
  personOutcome = 'unavailable',
  personEnrichmentPayload = null,
}: {
  outcome: string;
  enrichmentPayload: WorkspaceCompanyEnrichment | null;
  countCall: () => void;
  isBookCallOnboardingStepPending?: boolean;
  personOutcome?: string;
  personEnrichmentPayload?: WorkspacePersonEnrichment | null;
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
          personOutcome,
          personEnrichment: personEnrichmentPayload,
          isBookCallOnboardingStepPending,
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
    sessionStorage.clear();
    mockOnboardingStatus.mockReturnValue(OnboardingStatus.PROFILE_CREATION);
    jotaiStore.set(isCompanyEnrichmentEnabledState.atom, true);
  });

  it('does not fetch when enrichment has no consumer or api key', async () => {
    jotaiStore.set(isCompanyEnrichmentEnabledState.atom, false);

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
    expect(jotaiStore.get(hasAttemptedCompanyEnrichmentFetchState.atom)).toBe(
      false,
    );
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

  it('stays unsettled for a waiter while the fetch is in flight', async () => {
    let hasSettled = false;

    void waitForCompanyEnrichmentSettlement({
      store: jotaiStore,
      timeoutMs: 10_000,
    }).then(() => {
      hasSettled = true;
    });

    renderEffect([
      buildEnrichMock({
        outcome: 'matched',
        enrichmentPayload: enrichment,
        countCall: () => {},
      }),
    ]);

    await act(async () => {
      await Promise.resolve();
    });

    expect(jotaiStore.get(hasAttemptedCompanyEnrichmentFetchState.atom)).toBe(
      true,
    );
    expect(hasSettled).toBe(false);

    await flushMutation();

    expect(hasSettled).toBe(true);
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

  it('records the pending book-call step reported by the server', async () => {
    jotaiStore.set(currentUserState.atom, { id: 'user-id' } as never);

    renderEffect([
      buildEnrichMock({
        outcome: 'matched',
        enrichmentPayload: enrichment,
        countCall: () => {},
        isBookCallOnboardingStepPending: true,
      }),
    ]);

    await flushMutation();

    expect(
      getIsBookCallOnboardingStepPending(jotaiStore.get(currentUserState.atom)),
    ).toBe(true);
  });

  it('records the pending book-call step even when the enrichment did not match', async () => {
    jotaiStore.set(currentUserState.atom, { id: 'user-id' } as never);

    renderEffect([
      buildEnrichMock({
        outcome: 'transientError',
        enrichmentPayload: null,
        countCall: () => {},
        isBookCallOnboardingStepPending: true,
      }),
    ]);

    await flushMutation();

    expect(
      getIsBookCallOnboardingStepPending(jotaiStore.get(currentUserState.atom)),
    ).toBe(true);
  });

  it('drops a pending book-call step that lands after the user advanced past it', async () => {
    mockOnboardingStatus.mockReturnValue(OnboardingStatus.PROFILE_CREATION);
    jotaiStore.set(currentUserState.atom, {
      id: 'user-id',
      onboardingStatus: OnboardingStatus.PLAN_REQUIRED,
    } as never);

    let hasClearedBookCallStep = false;

    renderEffect([
      buildEnrichMock({
        outcome: 'matched',
        enrichmentPayload: enrichment,
        countCall: () => {},
        isBookCallOnboardingStepPending: true,
      }),
      {
        request: { query: CompleteBookCallOnboardingStepDocument },
        result: () => {
          hasClearedBookCallStep = true;

          return {
            data: {
              completeBookCallOnboardingStep: {
                __typename: 'OnboardingStepSuccess',
                success: true,
              },
            },
          };
        },
      },
    ]);

    await flushMutation();

    expect(
      getIsBookCallOnboardingStepPending(jotaiStore.get(currentUserState.atom)),
    ).toBe(false);
    expect(hasClearedBookCallStep).toBe(true);
    expect(jotaiStore.get(companyEnrichmentState.atom)).toMatchObject({
      domain: 'acme.com',
    });
  });

  it('keeps the step pending locally when clearing it on the server fails', async () => {
    jotaiStore.set(currentUserState.atom, {
      id: 'user-id',
      onboardingStatus: OnboardingStatus.PLAN_REQUIRED,
    } as never);

    renderEffect([
      buildEnrichMock({
        outcome: 'matched',
        enrichmentPayload: enrichment,
        countCall: () => {},
        isBookCallOnboardingStepPending: true,
      }),
      {
        request: { query: CompleteBookCallOnboardingStepDocument },
        result: { errors: [new GraphQLError('Internal server error')] },
      },
    ]);

    await flushMutation();

    // The server still has the offer, so local state must not claim otherwise.
    expect(
      getIsBookCallOnboardingStepPending(jotaiStore.get(currentUserState.atom)),
    ).toBe(true);
    expect(jotaiStore.get(companyEnrichmentState.atom)).toMatchObject({
      domain: 'acme.com',
    });
  });

  it('stores a matched person enrichment alongside the company one', async () => {
    renderEffect([
      buildEnrichMock({
        outcome: 'unavailable',
        enrichmentPayload: null,
        countCall: () => {},
        personOutcome: 'matched',
        personEnrichmentPayload: personEnrichment,
      }),
    ]);

    await flushMutation();

    expect(jotaiStore.get(personEnrichmentState.atom)).toMatchObject({
      email: 'ada@acme.com',
      jobTitle: 'Head of Sales',
    });
    expect(jotaiStore.get(companyEnrichmentState.atom)).toBeNull();
  });

  it('stores no person enrichment on a non-matched person outcome', async () => {
    renderEffect([
      buildEnrichMock({
        outcome: 'matched',
        enrichmentPayload: enrichment,
        countCall: () => {},
        personOutcome: 'unavailable',
      }),
    ]);

    await flushMutation();

    expect(jotaiStore.get(personEnrichmentState.atom)).toBeNull();
    expect(jotaiStore.get(companyEnrichmentState.atom)).toMatchObject({
      domain: 'acme.com',
    });
  });

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
