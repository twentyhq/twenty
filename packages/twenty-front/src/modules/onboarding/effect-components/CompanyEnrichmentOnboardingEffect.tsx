import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { currentUserState } from '@/auth/states/currentUserState';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { hasAttemptedCompanyEnrichmentFetchState } from '@/onboarding/states/hasAttemptedCompanyEnrichmentFetchState';
import { isCompanyEnrichmentFetchInFlightState } from '@/onboarding/states/isCompanyEnrichmentFetchInFlightState';
import { getHasAdvancedPastBookCallStep } from '@/onboarding/utils/getHasAdvancedPastBookCallStep';
import { setIsBookCallOnboardingStepPending } from '@/onboarding/utils/setIsBookCallOnboardingStepPending';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  CompleteBookCallOnboardingStepDocument,
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
  const [completeBookCallOnboardingStep] = useMutation(
    CompleteBookCallOnboardingStepDocument,
  );
  const setIsCompanyEnrichmentFetchInFlight = useSetAtomState(
    isCompanyEnrichmentFetchInFlightState,
  );
  const setCurrentUser = useSetAtomState(currentUserState);
  const store = useStore();

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

        // A response that lands after the settlement timeout must not reopen a
        // step the user already moved past, so the server is told to drop it.
        const hasAdvancedPastBookCallStep = getHasAdvancedPastBookCallStep(
          store.get(currentUserState.atom)?.onboardingStatus,
        );

        const dropBookCallStep = async () => {
          try {
            await completeBookCallOnboardingStep();

            return true;
          } catch {
            return false;
          }
        };

        // The local flag mirrors what the server ended up with: a failed drop
        // leaves the step pending on both sides instead of silently diverging.
        const hasDroppedBookCallStep =
          result.isBookCallOnboardingStepPending && hasAdvancedPastBookCallStep
            ? await dropBookCallStep()
            : false;

        setCurrentUser((current) =>
          setIsBookCallOnboardingStepPending(
            current,
            result.isBookCallOnboardingStepPending && !hasDroppedBookCallStep,
          ),
        );

        const enrichment: WorkspaceCompanyEnrichment | null =
          result.outcome === WorkspaceCompanyEnrichmentOutcome.matched
            ? (result.enrichment ?? null)
            : null;

        if (isDefined(enrichment)) {
          setCompanyEnrichment(enrichment);
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
    setHasAttemptedCompanyEnrichmentFetch,
    setIsCompanyEnrichmentFetchInFlight,
    setCompanyEnrichment,
    setCurrentUser,
    store,
    enrichWorkspaceCompany,
    completeBookCallOnboardingStep,
  ]);

  return null;
};
