import { useMutation } from '@apollo/client/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { isOnboardingAiChatEnabledState } from '@/client-config/states/isOnboardingAiChatEnabledState';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { hasAttemptedCompanyEnrichmentFetchState } from '@/onboarding/states/hasAttemptedCompanyEnrichmentFetchState';
import { isCompanyEnrichmentFetchInFlightState } from '@/onboarding/states/isCompanyEnrichmentFetchInFlightState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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
  const isOnboardingAiChatEnabled = useAtomStateValue(
    isOnboardingAiChatEnabledState,
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
      !isOnboardingAiChatEnabled
    ) {
      return;
    }

    setHasAttemptedCompanyEnrichmentFetch(true);
    setIsCompanyEnrichmentFetchInFlight(true);

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
        setIsCompanyEnrichmentFetchInFlight(false);
      }
    };

    void fetchCompanyEnrichment();
  }, [
    hasAttemptedCompanyEnrichmentFetch,
    companyEnrichment,
    isOnboardingInProgress,
    isOnboardingAiChatEnabled,
    setHasAttemptedCompanyEnrichmentFetch,
    setIsCompanyEnrichmentFetchInFlight,
    setCompanyEnrichment,
    enrichWorkspaceCompany,
  ]);

  return null;
};
