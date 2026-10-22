import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { buildConnectedAccountSenderOptions } from '@/accounts/utils/buildConnectedAccountSenderOptions';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { Select } from '@/ui/input/components/Select';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { EmailOperation } from 'twenty-shared/types';
import {
  canConnectedAccountPerformEmailOperation,
  isDefined,
} from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { UpdateMyDefaultFromHandleDocument } from '~/generated-metadata/graphql';

export const SettingsAccountsDefaultFromHandleSection = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();

  const myConnectedAccounts = useAtomStateValue(myConnectedAccountsState);
  const [currentUserWorkspace, setCurrentUserWorkspace] = useAtomState(
    currentUserWorkspaceState,
  );
  const [updateMyDefaultFromHandle] = useMutation(
    UpdateMyDefaultFromHandleDocument,
  );

  const sendableAccounts = (myConnectedAccounts ?? []).filter(
    (connectedAccount) =>
      !isDefined(connectedAccount.archivedAt) &&
      canConnectedAccountPerformEmailOperation({
        connectedAccount,
        operation: EmailOperation.SEND,
      }),
  );

  if (sendableAccounts.length === 0) {
    return null;
  }

  const options = [
    { label: t`Automatic (workspace domain)`, value: null },
    ...buildConnectedAccountSenderOptions(sendableAccounts),
  ];

  const storedDefaultFromHandle = currentUserWorkspace?.defaultFromHandle;

  const selectedValue = options.some(
    (option) => option.value === storedDefaultFromHandle,
  )
    ? (storedDefaultFromHandle ?? null)
    : null;

  const handleChange = async (defaultFromHandle: string | null) => {
    if (!isDefined(currentUserWorkspace)) {
      return;
    }

    try {
      await updateMyDefaultFromHandle({
        variables: { input: { defaultFromHandle } },
      });

      setCurrentUserWorkspace((previousUserWorkspace) =>
        isDefined(previousUserWorkspace)
          ? { ...previousUserWorkspace, defaultFromHandle }
          : previousUserWorkspace,
      );
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <Section.Root>
      <Select
        dropdownId="settings-default-from-handle"
        label={t`My default From address`}
        fullWidth
        value={selectedValue}
        options={options}
        onChange={handleChange}
      />
    </Section.Root>
  );
};
