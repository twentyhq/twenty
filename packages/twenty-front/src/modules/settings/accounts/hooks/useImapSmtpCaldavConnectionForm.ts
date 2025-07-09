import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
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
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const navigate = useNavigateSettings();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [saveConnection, { loading: saveLoading }] =
    useSaveImapSmtpCaldavMutation();

  const formMethods = useForm<ConnectionFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(connectionImapSmtpCalDav),
  });

  const { handleSubmit, formState, watch, reset } = formMethods;
  const { isValid, isSubmitting } = formState;

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

  const watchedValues = watch();

  const getConfiguredProtocols = useCallback(
    (
      values: ConnectionFormData = watchedValues,
    ): (keyof ImapSmtpCaldavAccount)[] => {
      return ACCOUNT_PROTOCOLS.filter((protocol) =>
        isProtocolConfigured(values[protocol] as ConnectionParameters),
      );
    },
    [watchedValues],
  );

  const validateWorkspaceRequirements = useCallback((): boolean => {
    if (!currentWorkspace?.id) {
      enqueueErrorSnackBar({ message: 'Workspace ID is missing' });
      return false;
    }

    if (!currentWorkspaceMember?.id) {
      enqueueErrorSnackBar({ message: 'Workspace member ID is missing' });
      return false;
    }

    return true;
  }, [currentWorkspace?.id, currentWorkspaceMember?.id, enqueueErrorSnackBar]);

  const saveIndividualConnection = useCallback(
    async (
      protocol: keyof ImapSmtpCaldavAccount,
      formValues: ConnectionFormData,
    ): Promise<void> => {
      if (!currentWorkspaceMember?.id) {
        throw new Error('Workspace member ID is missing');
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
          connectionParameters: formValues[protocol] as ConnectionParameters,
        },
      });
    },
    [saveConnection, isEditing, connectedAccountId, currentWorkspaceMember?.id],
  );

  const handleSave = useCallback(
    async (formValues: ConnectionFormData): Promise<void> => {
      if (!validateWorkspaceRequirements()) {
        return;
      }

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
      validateWorkspaceRequirements,
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
    connectedAccount: connectedAccount ?? null,
    getConfiguredProtocols,
  };
};
