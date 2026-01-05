import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  type ConnectedImapSmtpCaldavAccount,
  useConnectedImapSmtpCaldavAccount,
} from '@/settings/accounts/hooks/useConnectedImapSmtpCaldavAccount';
import { useCallback, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useSaveImapSmtpCaldavAccountMutation } from '~/generated-metadata/graphql';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { ApolloError } from '@apollo/client';
import { connectionWhatsapp } from '@/settings/integrations/validation-schemas/connectionWhatsapp';
import { useConnectedWhatsappAccount } from '@/settings/integrations/hooks/useConnectedWhatsappAccount';

export type ConnectionFormData = {
  businessId: string;
  webhookToken: string;
  appSecret: string;
};

type UseConnectionFormProps = {
  isEditing?: boolean;
  connectedAccountId?: string;
};

export const useWhatsappConnectionForm = ({
  isEditing = false,
  connectedAccountId,
}: UseConnectionFormProps) => {
  const navigate = useNavigateSettings();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const formMethods = useForm<ConnectionFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(connectionWhatsapp),
    defaultValues: {
      businessId: '',
      webhookToken: '',
      appSecret: '',
    },
  });

  const { handleSubmit, formState, watch, reset } = formMethods;
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { isSubmitting } = formState;

  const { connectedAccount, loading: accountLoading } =
    useConnectedWhatsappAccount(isEditing ? connectedAccountId : undefined,
      useCallback(
        (account: ConnectedWhatsappAccount | null) => {

        }
      ));
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
    useSaveImapSmtpCaldavAccountMutation();

  const watchedValues = watch();

  const isValid = useMemo(() => {
    return Boolean(watchedValues);
  }, [watchedValues]);

  const handleSave = useCallback(
    async (formValues: ConnectionFormData): Promise<void> => {
      if (!currentWorkspaceMember?.id) {
        throw new Error('Workspace member ID is missing');
      }

      try {
        const { data } = await saveConnection({
          variables: {
            ...(isEditing && connectedAccountId
              ? { id: connectedAccountId }
              : {}),
            accountOwnerId: currentWorkspaceMember.id,
            handle: formValues.businessId,
          },
        });
        if (!isDefined(data)) return;

        const successMessage = isEditing
          ? t`Connection successfully updated`
          : t`Connection successfully created`;

        enqueueSuccessSnackBar({ message: successMessage });

        const { connectedAccountId: returnedConnectedAccountId } =
          data?.saveImapSmtpCaldavAccount || {};

        navigate(SettingsPath.AccountsConfiguration, {
          connectedAccountId: returnedConnectedAccountId,
        });
      } catch (error) {
        enqueueErrorSnackBar({
          apolloError: error instanceof ApolloError ? error : undefined,
        });
      }
    },
    [
      currentWorkspaceMember?.id,
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
