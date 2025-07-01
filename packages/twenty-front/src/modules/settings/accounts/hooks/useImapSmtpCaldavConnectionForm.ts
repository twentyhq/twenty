import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { z } from 'zod';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { useSaveImapSmtpCaldavMutation } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { currentWorkspaceState } from '~/modules/auth/states/currentWorkspaceState';
import { useConnectedImapSmtpCaldavAccount } from './useConnectedImapSmtpCaldavAccount';

const DEFAULT_IMAP_PORT = 993;
const DEFAULT_SMTP_PORT = 587;
const DEFAULT_CALDAV_PORT = 443;

type ConnectionType = 'IMAP' | 'SMTP' | 'CALDAV';

type ConnectionFormData = {
  handle: string;
  host: string;
  port: number;
  password: string;
  secure: boolean;
};

type UseConnectionFormProps = {
  connectionType: ConnectionType;
  isEditing?: boolean;
  connectedAccountId?: string;
};

const createConnectionFormSchema = (connectionType: ConnectionType) => {
  const baseSchema = {
    handle: z.string().email('Invalid email address'),
    host: z.string().min(1, `${connectionType} server is required`),
    port: z.number().int().positive('Port must be a positive number'),
    secure: z.boolean(),
    password: z.string().min(1, 'Password is required'),
  };

  return z.object(baseSchema);
};

const getDefaultPort = (connectionType: ConnectionType): number => {
  switch (connectionType) {
    case 'IMAP':
      return DEFAULT_IMAP_PORT;
    case 'SMTP':
      return DEFAULT_SMTP_PORT;
    case 'CALDAV':
      return DEFAULT_CALDAV_PORT;
  }
};

export const useImapSmtpCaldavConnectionForm = ({
  connectionType,
  isEditing = false,
  connectedAccountId,
}: UseConnectionFormProps) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [saveConnection, { loading: saveLoading }] =
    useSaveImapSmtpCaldavMutation();

  const schema = createConnectionFormSchema(connectionType);
  const resolver = zodResolver(schema);

  const defaultValues: ConnectionFormData = {
    handle: '',
    host: '',
    port: getDefaultPort(connectionType),
    password: '',
    secure: true,
  };

  const formConfig = useForm<ConnectionFormData>({
    mode: 'onSubmit',
    resolver,
    defaultValues,
  });

  const { connectedAccount, loading: accountLoading } =
    useConnectedImapSmtpCaldavAccount(
      isEditing ? connectedAccountId : undefined,
      (data) => {
        if (!data) return;

        const connectionParams = data.connectionParameters?.[connectionType];

        formConfig.reset({
          handle: data.handle || '',
          host: connectionParams?.host || '',
          port: connectionParams?.port || getDefaultPort(connectionType),
          password: connectionParams?.password || '',
          secure: connectionParams?.secure ?? true,
        });
      },
    );

  const { handleSubmit, formState } = formConfig;
  const { isValid, isSubmitting } = formState;
  const canSave = isValid && !isSubmitting;
  const loading = saveLoading;

  const handleSave = async (formValues: ConnectionFormData) => {
    if (!currentWorkspace?.id) {
      enqueueSnackBar('Workspace ID is missing', {
        variant: SnackBarVariant.Error,
      });
      return;
    }

    if (!currentWorkspaceMember?.id) {
      enqueueSnackBar('Workspace member ID is missing', {
        variant: SnackBarVariant.Error,
      });
      return;
    }

    try {
      await saveConnection({
        variables: {
          ...(isEditing && connectedAccountId
            ? { id: connectedAccountId }
            : {}),
          accountOwnerId: currentWorkspaceMember.id,
          handle: formValues.handle,
          accountType: {
            type: connectionType,
          },
          connectionParameters: {
            host: formValues.host,
            port: formValues.port,
            secure: formValues.secure,
            password: formValues.password,
          },
        },
      });

      const successMessage = isEditing
        ? t`${connectionType} connection successfully updated`
        : t`${connectionType} connection successfully created`;

      enqueueSnackBar(successMessage, {
        variant: SnackBarVariant.Success,
      });

      navigate(SettingsPath.Accounts);
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    formMethods: formConfig,
    handleSave,
    handleSubmit,
    canSave,
    isSubmitting,
    loading: accountLoading || loading,
    connectedAccount,
  };
};
