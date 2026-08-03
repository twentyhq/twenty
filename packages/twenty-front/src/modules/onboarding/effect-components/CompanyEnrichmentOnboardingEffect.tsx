import { useMutation } from '@apollo/client/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { currentUserState } from '@/auth/states/currentUserState';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { hasAttemptedCompanyEnrichmentFetchState } from '@/onboarding/states/hasAttemptedCompanyEnrichmentFetchState';
import { isCompanyEnrichmentFetchInFlightState } from '@/onboarding/states/isCompanyEnrichmentFetchInFlightState';
import { setIsBookCallOnboardingStepPending } from '@/onboarding/utils/setIsBookCallOnboardingStepPending';
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
  const [enrichWorkspaceCompany] = useMutation(EnrichWorkspaceCompanyDocument);
  const setIsCompanyEnrichmentFetchInFlight = useSetAtomState(
    isCompanyEnrichmentFetchInFlightState,
  );
  const setCurrentUser = useSetAtomState(currentUserState);

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

    setIsCompanyEnrichmentFetchInFlight(true);
    setHasAttemptedCompanyEnrichmentFetch(true);

    const fetchCompanyEnrichment = async () => {
      try {
        const { data } = await enrichWorkspaceCompany();
        const result = data?.enrichWorkspaceCompany;

        if (!isDefined(result)) {
          return;
        }

        setCurrentUser((current) =>
          setIsBookCallOnboardingStepPending(
            current,
            result.isBookCallOnboardingStepPending,
          ),
        );

        if (result.outcome !== WorkspaceCompanyEnrichmentOutcome.matched) {
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
        setIsCompanyEnrichmentFetchInFlight(false);
      }
    };

    void fetchCompanyEnrichment();
  }, [
    hasAttemptedCompanyEnrichmentFetch,
    companyEnrichment,
    isOnboardingInProgress,
    setHasAttemptedCompanyEnrichmentFetch,
    setIsCompanyEnrichmentFetchInFlight,
    setCompanyEnrichment,
    setCurrentUser,
    enrichWorkspaceCompany,
  ]);

  return null;
};
