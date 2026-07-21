import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLazyQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { BillingPortalSessionDocument } from '~/generated-metadata/graphql';

export const useBillingPortalSession = (returnUrlPath: string) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { redirect } = useRedirect();
  const { enqueueErrorSnackBar } = useSnackBar();

  const hasSubscriptions =
    (currentWorkspace?.billingSubscriptions.length ?? 0) > 0;

  const [getBillingPortalSession, { loading }] = useLazyQuery(
    BillingPortalSessionDocument,
    {
      fetchPolicy: 'network-only',
    },
  );

  const showBillingPortalSessionError = () => {
    enqueueErrorSnackBar({
      message: t`Billing portal session error. Please retry or contact Twenty team`,
    });
  };

  const isBillingPortalSessionDisabled = !hasSubscriptions || loading;

  const openBillingPortal = async () => {
    if (isBillingPortalSessionDisabled) {
      return;
    }

    try {
      const { data } = await getBillingPortalSession({
        variables: {
          returnUrlPath,
        },
      });

      const billingPortalSessionUrl = data?.billingPortalSession.url;

      if (!isDefined(billingPortalSessionUrl)) {
        showBillingPortalSessionError();
        return;
      }

      redirect(billingPortalSessionUrl);
    } catch {
      showBillingPortalSessionError();
    }
  };

  return {
    isBillingPortalSessionDisabled,
    openBillingPortal,
  };
};
