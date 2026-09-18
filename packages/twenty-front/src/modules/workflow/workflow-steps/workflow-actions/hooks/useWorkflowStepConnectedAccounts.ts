import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { WORKFLOW_STEP_CONNECTED_ACCOUNT_HANDLE } from '@/workflow/graphql/queries/workflowStepConnectedAccountHandle';
import { useQuery } from '@apollo/client/react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

type WorkflowStepConnectedAccount = Pick<
  ConnectedAccount,
  'id' | 'handle' | 'provider' | 'handleAliases'
>;

type UseWorkflowStepConnectedAccountsParams = {
  connectedAccountId: string;
  isSelectableAccount: (account: ConnectedAccount) => boolean;
};

export const useWorkflowStepConnectedAccounts = ({
  connectedAccountId,
  isSelectableAccount,
}: UseWorkflowStepConnectedAccountsParams) => {
  const apolloCoreClient = useApolloCoreClient();

  const { accounts: myAccounts, loading: myAccountsLoading } =
    useMyConnectedAccounts();

  const myConfiguredAccount = myAccounts.find(
    (account) => account.id === connectedAccountId,
  );

  const { data: teammateAccountData, loading: teammateAccountLoading } =
    useQuery<{
      workflowStepConnectedAccountHandle: WorkflowStepConnectedAccount | null;
    }>(WORKFLOW_STEP_CONNECTED_ACCOUNT_HANDLE, {
      client: apolloCoreClient,
      variables: { connectedAccountId },
      skip:
        myAccountsLoading ||
        !isValidUuid(connectedAccountId) ||
        isDefined(myConfiguredAccount),
    });

  const configuredAccount: WorkflowStepConnectedAccount | undefined =
    myConfiguredAccount ??
    teammateAccountData?.workflowStepConnectedAccountHandle ??
    undefined;

  const selectableAccounts: WorkflowStepConnectedAccount[] =
    myAccounts.filter(isSelectableAccount);

  const isConfiguredAccountSelectable =
    !isDefined(configuredAccount) ||
    selectableAccounts.some((account) => account.id === configuredAccount.id);

  return {
    accounts: isConfiguredAccountSelectable
      ? selectableAccounts
      : [...selectableAccounts, configuredAccount],
    configuredAccount,
    myConfiguredAccount,
    isConfiguredAccountRemoved:
      teammateAccountData?.workflowStepConnectedAccountHandle === null,
    loading: myAccountsLoading || teammateAccountLoading,
  };
};
