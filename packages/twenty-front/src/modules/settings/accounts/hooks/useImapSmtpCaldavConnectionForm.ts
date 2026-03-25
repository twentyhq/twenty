import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { useMutation } from '@apollo/client/react';
import {
  type ConnectionParameters,
  SaveImapSmtpCaldavAccountDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

import { type ImapSmtpCaldavAccount } from '@/accounts/types/ImapSmtpCaldavAccount';
import { ACCOUNT_PROTOCOLS } from '@/settings/accounts/constants/AccountProtocols';
import {
  connectionImapSmtpCalDav,
  isProtocolConfigured,
} from '@/settings/accounts/validation-schemas/connectionImapSmtpCalDav';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { isDefined } from 'twenty-shared/utils';
import { useConnectedImapSmtpCaldavAccount } from './useConnectedImapSmtpCaldavAccount';

type UseConnectionFormProps = {
  isEditing?: boolean;
  connectedAccountId?: string;
};

export type ConnectionFormData = {
  handle: string;
} & ImapSmtpCaldavAccount;

export const useImapSmtpCaldavConnectionForm = ({
  isEditing = false,
  connectedAccountId,
}: UseConnectionFormProps = {}) => {
  const navigate = useNavigateSettings();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const formMethods = useForm<ConnectionFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(connectionImapSmtpCalDav),
    defaultValues: {
      handle: '',
      IMAP: { host: '', port: 993, password: '', secure: true },
      SMTP: { host: '', username: '', port: 587, password: '', secure: true },
      CALDAV: {
        host: '',
        port: 443,
        password: '',
        secure: true,
        username: undefined,
      },
    },
  });

  const { handleSubmit, formState, watch, reset } = formMethods;
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { isSubmitting } = formState;

  const { connectedAccount, loading: accountLoading } =
    useConnectedImapSmtpCaldavAccount(
      isEditing ? connectedAccountId : undefined,
    );

  useEffect(() => {
    if (isDefined(connectedAccount)) {
      reset({
        handle: connectedAccount.handle || '',
        IMAP: connectedAccount.connectionParameters?.IMAP || undefined,
        SMTP: connectedAccount.connectionParameters?.SMTP || undefined,
        CALDAV: connectedAccount.connectionParameters?.CALDAV || undefined,
      });
    }
  }, [connectedAccount, reset]);

  const [saveConnection, { loading: saveLoading }] = useMutation(
    SaveImapSmtpCaldavAccountDocument,
  );

  const watchedValues = watch();

  const getConfiguredProtocols = useCallback(
    (
      values: ConnectionFormData = watchedValues,
    ): (keyof ImapSmtpCaldavAccount)[] => {
      return ACCOUNT_PROTOCOLS.filter((protocol) => {
        const protocolConfig = values[protocol];
        return (
          protocolConfig &&
          isProtocolConfigured(protocolConfig as ConnectionParameters)
        );
      });
    },
    [watchedValues],
  );

  const isValid = useMemo(() => {
    return (
      Boolean(watchedValues.handle?.trim()) &&
      getConfiguredProtocols().length > 0
    );
  }, [getConfiguredProtocols, watchedValues.handle]);

  const handleSave = useCallback(
    async (formValues: ConnectionFormData): Promise<void> => {
      if (!currentWorkspaceMember?.id) {
        throw new Error('Workspace member ID is missing');
      }

      const configuredProtocols = getConfiguredProtocols(formValues);

      if (configuredProtocols.length === 0) {
        throw new Error('At least one protocol must be configured');
      }

      const connectionParameters: Partial<
        Record<keyof ImapSmtpCaldavAccount, ConnectionParameters>
      > = {};
      configuredProtocols.forEach((protocol) => {
        const protocolConfig = formValues[protocol];
        if (isDefined(protocolConfig)) {
          connectionParameters[protocol] = protocolConfig;
        }
      });

      try {
        const { data } = await saveConnection({
          variables: {
            ...(isEditing && connectedAccountId
              ? { id: connectedAccountId }
              : {}),
            accountOwnerId: currentWorkspaceMember.id,
            handle: formValues.handle,
            connectionParameters,
          },
        });
        if (!isDefined(data)) return;

        const successMessage = isEditing
          ? t`Connection successfully updated`
          : t`Connection successfully created`;

        enqueueSuccessSnackBar({ message: successMessage });

        const { connectedAccountId: returnedConnectedAccountId } =
          data?.saveImapSmtpCaldavAccount ?? {};

        navigate(SettingsPath.AccountsConfiguration, {
          connectedAccountId: returnedConnectedAccountId,
        });
      } catch (error) {
        enqueueErrorSnackBar({
          apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
        });
      }
    },
    [
      currentWorkspaceMember?.id,
      getConfiguredProtocols,
      saveConnection,
      isEditing,
      connectedAccountId,
      enqueueSuccessSnackBar,
      navigate,
      enqueueErrorSnackBar,
    ],
  );

  const canSave = isValid && !isSubmitting;
  const loading = accountLoading || saveLoading;

  return {
    formMethods,
    handleSave,
    handleSubmit,
    canSave,
    isSubmitting,
    loading,
    connectedAccount,
  };
};
