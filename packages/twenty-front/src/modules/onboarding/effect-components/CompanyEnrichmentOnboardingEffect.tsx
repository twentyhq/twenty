import { useMutation } from '@apollo/client/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type WorkspaceCompanyEnrichment,
  type WorkspacePersonEnrichment,
} from 'twenty-shared/workspace';

import { isCompanyEnrichmentEnabledState } from '@/client-config/states/isCompanyEnrichmentEnabledState';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { hasAttemptedCompanyEnrichmentFetchState } from '@/onboarding/states/hasAttemptedCompanyEnrichmentFetchState';
import { isCompanyEnrichmentFetchInFlightState } from '@/onboarding/states/isCompanyEnrichmentFetchInFlightState';
import { personEnrichmentState } from '@/onboarding/states/personEnrichmentState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  EnrichWorkspaceCompanyDocument,
  OnboardingStatus,
  WorkspaceCompanyEnrichmentOutcome,
  WorkspacePersonEnrichmentOutcome,
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
  const setPersonEnrichment = useSetAtomState(personEnrichmentState);
  const isCompanyEnrichmentEnabled = useAtomStateValue(
    isCompanyEnrichmentEnabledState,
  );

  const isOnboardingInProgress =
    isDefined(onboardingStatus) &&
    onboardingStatus !== OnboardingStatus.COMPLETED &&
    onboardingStatus !== OnboardingStatus.WORKSPACE_ACTIVATION;

  useEffect(() => {
    if (
      hasAttemptedCompanyEnrichmentFetch ||
      isDefined(companyEnrichment) ||
      !isOnboardingInProgress ||
      !isCompanyEnrichmentEnabled
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

        const enrichment: WorkspaceCompanyEnrichment | null =
          result.outcome === WorkspaceCompanyEnrichmentOutcome.matched
            ? (result.enrichment ?? null)
            : null;

        if (isDefined(enrichment)) {
          setCompanyEnrichment(enrichment);
        }

        const personEnrichment: WorkspacePersonEnrichment | null =
          result.personOutcome === WorkspacePersonEnrichmentOutcome.matched
            ? (result.personEnrichment ?? null)
            : null;

        if (isDefined(personEnrichment)) {
          setPersonEnrichment(personEnrichment);
        }
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
    isCompanyEnrichmentEnabled,
    setHasAttemptedCompanyEnrichmentFetch,
    setIsCompanyEnrichmentFetchInFlight,
    setCompanyEnrichment,
    setPersonEnrichment,
    enrichWorkspaceCompany,
  ]);

  return null;
};
