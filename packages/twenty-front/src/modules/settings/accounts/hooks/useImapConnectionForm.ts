import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { z } from 'zod';

import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import {
  ConnectionParameters,
  useSaveImapSmtpCaldavMutation,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { currentWorkspaceMemberState } from '~/modules/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '~/modules/auth/states/currentWorkspaceState';

const imapConnectionFormSchema = z.object({
  handle: z.string().email('Invalid email address'),
  host: z.string().min(1, 'IMAP server is required'),
  port: z.number().int().positive('Port must be a positive number'),
  secure: z.boolean(),
  password: z.string().min(1, 'Password is required'),
});

type ImapConnectionFormValues = z.infer<typeof imapConnectionFormSchema>;

type UseImapConnectionFormProps = {
  initialData?: ImapConnectionFormValues;
  isEditing?: boolean;
  connectedAccountId?: string;
};

export const useImapConnectionForm = ({
  initialData,
  isEditing = false,
  connectedAccountId,
}: UseImapConnectionFormProps = {}) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [saveImapConnection, { loading: saveLoading }] =
    useSaveImapSmtpCaldavMutation();

  const resolver = zodResolver(imapConnectionFormSchema);

  const defaultValues = {
    handle: initialData?.handle || '',
    host: initialData?.host || '',
    port: initialData?.port || 993,
    secure: initialData?.secure ?? true,
    password: initialData?.password || '',
  };

  const formMethods = useForm<ConnectionParameters & { handle: string }>({
    mode: 'onSubmit',
    resolver,
    defaultValues,
  });

  const { handleSubmit, formState } = formMethods;
  const { isValid, isSubmitting } = formState;
  const canSave = isValid && !isSubmitting;
  const loading = saveLoading;

  const handleSave = async (
    formValues: ConnectionParameters & { handle: string },
  ) => {
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
      const variables = {
        ...(isEditing && connectedAccountId ? { id: connectedAccountId } : {}),
        accountOwnerId: currentWorkspaceMember.id,
        handle: formValues.handle,
        host: formValues.host,
        port: formValues.port,
        secure: formValues.secure,
        password: formValues.password,
      };

      await saveImapConnection({
        variables: {
          accountOwnerId: variables.accountOwnerId,
          handle: variables.handle,
          accountType: {
            type: 'IMAP',
          },
          connectionParameters: {
            host: variables.host,
            port: variables.port,
            secure: variables.secure,
            password: variables.password,
            username: variables.handle,
          },
          ...(variables.id ? { id: variables.id } : {}),
        },
      });

      enqueueSnackBar(
        connectedAccountId
          ? t`IMAP connection successfully updated`
          : t`IMAP connection successfully created`,
        {
          variant: SnackBarVariant.Success,
        },
      );

      navigate(SettingsPath.Accounts);
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    formMethods,
    handleSave,
    handleSubmit,
    canSave,
    isSubmitting,
    loading,
  };
};
