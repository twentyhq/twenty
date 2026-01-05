import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useCallback, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useSaveWhatsappAccountMutation } from '~/generated-metadata/graphql';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { ApolloError } from '@apollo/client';
import { connectionWhatsapp } from '@/settings/integrations/validation-schemas/connectionWhatsapp';
import {
  type ConnectedWhatsappAccount,
  useConnectedWhatsappAccount,
} from '@/settings/integrations/hooks/useConnectedWhatsappAccount';

export type ConnectionFormData = {
  businessId: string;
  webhookToken: string;
  appSecret: string;
  bearerToken: string;
};

type UseConnectionFormProps = {
  isEditing?: boolean;
  connectedAccountId?: string;
  businessAccountId?: string;
};

export const useWhatsappConnectionForm = ({
  isEditing = false,
  connectedAccountId,
  businessAccountId,
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
      bearerToken: '',
    },
  });

  const { handleSubmit, formState, watch, reset } = formMethods;
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { isSubmitting } = formState;

  const { connectedAccount, loading: accountLoading } =
    useConnectedWhatsappAccount(
      isEditing ? connectedAccountId : undefined,
      isEditing ? businessAccountId : undefined,
      useCallback(
        (account: ConnectedWhatsappAccount | null) => {
          if (isDefined(account)) {
            reset({
              businessId: account.businessAccountId || '',
              appSecret: account.appSecret || '',
              bearerToken: account.bearerToken || '',
              webhookToken: account.webhookToken || '',
            });
          }
        },
        [reset],
      ),
    );

  const [saveConnection, { loading: saveLoading }] =
    useSaveWhatsappAccountMutation();

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
            businessAccountId: formValues.businessId,
            bearerToken: '',
            appSecret: '',
            webhookToken: '',
          },
        });
        if (!isDefined(data)) return;

        const successMessage = isEditing
          ? t`Connection successfully updated`
          : t`Connection successfully created`;

        enqueueSuccessSnackBar({ message: successMessage });

        const { connectedAccountId: returnedConnectedAccountId } =
          data?.saveWhatsappAccount || {};

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
