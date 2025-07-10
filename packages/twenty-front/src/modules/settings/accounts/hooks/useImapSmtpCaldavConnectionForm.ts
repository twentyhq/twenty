import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { SettingsPath } from '@/types/SettingsPath';
import { t } from '@lingui/core/macro';
import {
  ConnectionParameters,
  useSaveImapSmtpCaldavMutation,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

import { ImapSmtpCaldavAccount } from '@/accounts/types/ImapSmtpCaldavAccount';
import { ACCOUNT_PROTOCOLS } from '@/settings/accounts/constants/AccountProtocols';
import {
  connectionImapSmtpCalDav,
  isProtocolConfigured,
} from '@/settings/accounts/validation-schemas/connectionImapSmtpCalDav';
import { isDefined } from 'twenty-shared/utils';
import {
  ConnectedImapSmtpCaldavAccount,
  useConnectedImapSmtpCaldavAccount,
} from './useConnectedImapSmtpCaldavAccount';

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
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const formMethods = useForm<ConnectionFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(connectionImapSmtpCalDav),
    defaultValues: {
      handle: '',
      IMAP: { host: '', port: 993, password: '', secure: true },
      SMTP: { host: '', port: 587, password: '', secure: true },
      CALDAV: { host: '', port: 443, password: '', secure: true },
    },
  });

  const { handleSubmit, formState, watch, reset } = formMethods;
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { isSubmitting } = formState;

  const { connectedAccount, loading: accountLoading } =
    useConnectedImapSmtpCaldavAccount(
      isEditing ? connectedAccountId : undefined,
      useCallback(
        (account: ConnectedImapSmtpCaldavAccount | null) => {
          if (isDefined(account)) {
            reset({
              handle: account.handle || '',
              IMAP: account.connectionParameters?.IMAP || undefined,
              SMTP: account.connectionParameters?.SMTP || undefined,
              CALDAV: account.connectionParameters?.CALDAV || undefined,
            });
          }
        },
        [reset],
      ),
    );

  const [saveConnection, { loading: saveLoading }] =
    useSaveImapSmtpCaldavMutation();

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

  const saveIndividualConnection = useCallback(
    async (
      protocol: keyof ImapSmtpCaldavAccount,
      formValues: ConnectionFormData,
    ): Promise<void> => {
      if (!currentWorkspaceMember?.id) {
        throw new Error('Workspace member ID is missing');
      }

      const protocolConfig = formValues[protocol];
      if (!protocolConfig) {
        throw new Error(`${protocol} configuration is missing`);
      }

      await saveConnection({
        variables: {
          ...(isEditing && connectedAccountId
            ? { id: connectedAccountId }
            : {}),
          accountOwnerId: currentWorkspaceMember.id,
          handle: formValues.handle,
          accountType: {
            type: protocol,
          },
          connectionParameters: protocolConfig,
        },
      });
    },
    [saveConnection, isEditing, connectedAccountId, currentWorkspaceMember?.id],
  );

  const handleSave = useCallback(
    async (formValues: ConnectionFormData): Promise<void> => {
      const configuredProtocols = getConfiguredProtocols(formValues);

      try {
        await Promise.all(
          configuredProtocols.map((protocol) =>
            saveIndividualConnection(protocol, formValues),
          ),
        );

        const successMessage = isEditing
          ? t`Connection successfully updated`
          : t`Connection successfully created`;

        enqueueSuccessSnackBar({ message: successMessage });
        navigate(SettingsPath.Accounts);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';

        enqueueErrorSnackBar({ message: errorMessage });
      }
    },
    [
      getConfiguredProtocols,
      saveIndividualConnection,
      isEditing,
      enqueueSuccessSnackBar,
      enqueueErrorSnackBar,
      navigate,
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
