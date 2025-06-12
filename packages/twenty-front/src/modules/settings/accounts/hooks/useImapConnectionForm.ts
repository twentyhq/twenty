import { gql, useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { z } from 'zod';

import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { MessageChannelVisibility } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { currentWorkspaceMemberState } from '~/modules/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '~/modules/auth/states/currentWorkspaceState';

const SAVE_IMAP_CONNECTION = gql`
  mutation SaveImapConnection($input: SaveImapConnectionInput!) {
    saveImapConnection(input: $input)
  }
`;

const UPDATE_IMAP_CONNECTION = gql`
  mutation UpdateImapConnection($input: SaveImapConnectionInput!) {
    saveImapConnection(input: $input)
  }
`;

const imapConnectionFormSchema = z.object({
  handle: z.string().email('Invalid email address'),
  host: z.string().min(1, 'IMAP server is required'),
  port: z.number().int().positive('Port must be a positive number'),
  secure: z.boolean(),
  password: z.string().min(1, 'Password is required').or(z.string().optional()),
  messageVisibility: z.nativeEnum(MessageChannelVisibility).optional(),
});

export type ImapConnectionFormValues = z.infer<typeof imapConnectionFormSchema>;

type ImapConnectionData = {
  handle?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  messageVisibility?: MessageChannelVisibility;
};

type UseImapConnectionFormProps = {
  initialData?: ImapConnectionData;
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
    useMutation(SAVE_IMAP_CONNECTION);

  const resolver = isEditing
    ? zodResolver(
        imapConnectionFormSchema.omit({ password: true }).merge(
          z.object({
            password: z.string().optional(),
          }),
        ),
      )
    : zodResolver(imapConnectionFormSchema);

  const defaultValues = {
    handle: initialData?.handle || '',
    host: initialData?.host || '',
    port: initialData?.port || 993,
    secure: initialData?.secure ?? true,
    password: '',
    messageVisibility:
      initialData?.messageVisibility ||
      MessageChannelVisibility.SHARE_EVERYTHING,
  };

  const formMethods = useForm<ImapConnectionFormValues>({
    mode: 'onSubmit',
    resolver,
    defaultValues,
  });

  const { handleSubmit, formState } = formMethods;
  const { isValid, isSubmitting } = formState;
  const canSave = isValid && !isSubmitting;
  const loading = saveLoading || updateLoading;

  const handleSave = async (formValues: ImapConnectionFormValues) => {
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
      const input = {
        ...(isEditing && connectedAccountId ? { id: connectedAccountId } : {}),
        accountOwnerId: currentWorkspaceMember.id,
        handle: formValues.handle,
        host: formValues.host,
        port: formValues.port,
        secure: formValues.secure,
        ...(formValues.password || !isEditing
          ? { password: formValues.password }
          : {}),
        messageVisibility: formValues.messageVisibility,
      };

      await saveImapConnection({
        variables: { input },
      });

      enqueueSnackBar(
        isEditing
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
