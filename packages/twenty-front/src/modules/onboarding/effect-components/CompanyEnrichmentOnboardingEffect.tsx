import { useMutation } from '@apollo/client/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { hasAttemptedCompanyEnrichmentFetchState } from '@/onboarding/states/hasAttemptedCompanyEnrichmentFetchState';
import { hasSettledCompanyEnrichmentFetchState } from '@/onboarding/states/hasSettledCompanyEnrichmentFetchState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  EnrichWorkspaceCompanyDocument,
  OnboardingStatus,
  WorkspaceCompanyEnrichmentOutcome,
} from '~/generated-metadata/graphql';

export const CompanyEnrichmentOnboardingEffect = () => {
  const onboardingStatus = useOnboardingStatus();
  const [companyEnrichment, setCompanyEnrichment] = useAtomState(
    companyEnrichmentState,
  );
  const [
    hasAttemptedCompanyEnrichmentFetch,
    setHasAttemptedCompanyEnrichmentFetch,
  ] = useAtomState(hasAttemptedCompanyEnrichmentFetchState);
  const setHasSettledCompanyEnrichmentFetch = useSetAtomState(
    hasSettledCompanyEnrichmentFetchState,
  );
  const [enrichWorkspaceCompany] = useMutation(EnrichWorkspaceCompanyDocument);

  const isOnboardingInProgress =
    isDefined(onboardingStatus) &&
    onboardingStatus !== OnboardingStatus.COMPLETED &&
    onboardingStatus !== OnboardingStatus.WORKSPACE_ACTIVATION;

  useEffect(() => {
    if (
      hasAttemptedCompanyEnrichmentFetch ||
      isDefined(companyEnrichment) ||
      !isOnboardingInProgress
    ) {
      return;
    }

    setHasAttemptedCompanyEnrichmentFetch(true);

    const fetchCompanyEnrichment = async () => {
      try {
        const { data } = await enrichWorkspaceCompany();
        const result = data?.enrichWorkspaceCompany;

        if (result?.outcome !== WorkspaceCompanyEnrichmentOutcome.matched) {
          return;
        }

        const enrichment: WorkspaceCompanyEnrichment | null =
          result.enrichment ?? null;

        if (!isDefined(enrichment)) {
          return;
        }

        setCompanyEnrichment(enrichment);
      } catch {
        return;
      } finally {
        // Every outcome counts as settled, including the ones that store nothing:
        // the onboarding flow needs to tell "not qualified" apart from "not answered
        // yet" before it decides whether the book-a-call step comes next.
        setHasSettledCompanyEnrichmentFetch(true);
      }
    };

    void fetchCompanyEnrichment();
  }, [
    hasAttemptedCompanyEnrichmentFetch,
    companyEnrichment,
    isOnboardingInProgress,
    setHasAttemptedCompanyEnrichmentFetch,
    setHasSettledCompanyEnrichmentFetch,
    setCompanyEnrichment,
    enrichWorkspaceCompany,
  ]);

  return null;
};
