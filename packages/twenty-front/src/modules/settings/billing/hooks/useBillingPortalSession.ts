import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { BillingPortalSessionDocument } from '~/generated-metadata/graphql';

export const useBillingPortalSession = (returnUrlPath: string) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { redirect } = useRedirect();

  const hasSubscriptions =
    (currentWorkspace?.billingSubscriptions.length ?? 0) > 0;

  const { data, loading } = useQuery(BillingPortalSessionDocument, {
    variables: {
      returnUrlPath,
    },
    skip: !hasSubscriptions,
  });

  const billingPortalSessionUrl = data?.billingPortalSession.url;
  const isBillingPortalSessionDisabled =
    loading || !isDefined(billingPortalSessionUrl);

  const openBillingPortal = () => {
    if (isDefined(billingPortalSessionUrl)) {
      redirect(billingPortalSessionUrl);
    }
  };

  return {
    isBillingPortalSessionDisabled,
    openBillingPortal,
  };
};
