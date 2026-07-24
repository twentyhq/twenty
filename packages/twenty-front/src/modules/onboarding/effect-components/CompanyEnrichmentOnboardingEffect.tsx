import { useMutation } from '@apollo/client/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichmentResult } from 'twenty-shared/workspace';

import { ENRICH_WORKSPACE_COMPANY } from '@/onboarding/graphql/mutations/enrichWorkspaceCompany';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { hasAttemptedCompanyEnrichmentFetchState } from '@/onboarding/states/hasAttemptedCompanyEnrichmentFetchState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export const CompanyEnrichmentOnboardingEffect = () => {
  const onboardingStatus = useOnboardingStatus();
  const [companyEnrichment, setCompanyEnrichment] = useAtomState(
    companyEnrichmentState,
  );
  const [
    hasAttemptedCompanyEnrichmentFetch,
    setHasAttemptedCompanyEnrichmentFetch,
  ] = useAtomState(hasAttemptedCompanyEnrichmentFetchState);
  const [enrichWorkspaceCompany] = useMutation<{
    enrichWorkspaceCompany: WorkspaceCompanyEnrichmentResult;
  }>(ENRICH_WORKSPACE_COMPANY);

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

        if (!isDefined(result) || result.outcome === 'transientError') {
          return;
        }

        setCompanyEnrichment({
          fetchedAt: new Date().toISOString(),
          enrichment: result.enrichment,
        });
      } catch {
        return;
      }
    };

    void fetchCompanyEnrichment();
  }, [
    hasAttemptedCompanyEnrichmentFetch,
    companyEnrichment,
    isOnboardingInProgress,
    setHasAttemptedCompanyEnrichmentFetch,
    setCompanyEnrichment,
    enrichWorkspaceCompany,
  ]);

  return null;
};
