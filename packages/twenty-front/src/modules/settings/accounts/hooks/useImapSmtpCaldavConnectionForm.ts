import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import {
  type ConnectionParametersInput,
  EmailConnectionSecurity,
  SaveImapSmtpCaldavAccountDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

import { type ImapSmtpCaldavAccountInput } from '@/accounts/types/ImapSmtpCaldavAccountInput';
import {
  isProtocolConfigured,
  isProtocolConfiguredForUpdate,
} from '@/settings/accounts/utils/isProtocolConfigured';
import {
  connectionImapSmtpCalDav,
  connectionImapSmtpCalDavUpdate,
} from '@/settings/accounts/validation-schemas/connectionImapSmtpCalDav';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { isNonEmptyString } from '@sniptt/guards';
import { ACCOUNT_TYPES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { useConnectedImapSmtpCaldavAccount } from './useConnectedImapSmtpCaldavAccount';

type UseConnectionFormProps = {
  isEditing?: boolean;
  connectedAccountId?: string;
};

export type ConnectionFormData = {
  handle: string;
} & ImapSmtpCaldavAccountInput;

const DEFAULT_PROTOCOL_VALUES: Record<string, ConnectionParametersInput> = {
  IMAP: {
    host: '',
    port: 993,
    password: '',
    connectionSecurity: EmailConnectionSecurity.SSL_TLS,
  },
  SMTP: {
    host: '',
    username: '',
    port: 587,
    password: '',
    connectionSecurity: EmailConnectionSecurity.STARTTLS,
  },
  CALDAV: {
    host: '',
    port: 443,
    password: '',
    connectionSecurity: EmailConnectionSecurity.SSL_TLS,
  },
};

export const useImapSmtpCaldavConnectionForm = ({
  isEditing = false,
  connectedAccountId,
}: UseConnectionFormProps = {}) => {
  const navigate = useNavigateSettings();

  const formMethods = useForm<ConnectionFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(
      isEditing ? connectionImapSmtpCalDavUpdate : connectionImapSmtpCalDav,
    ),
    defaultValues: {
      handle: '',
      ...DEFAULT_PROTOCOL_VALUES,
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
        IMAP: {
          ...DEFAULT_PROTOCOL_VALUES.IMAP,
          ...connectedAccount.connectionParameters?.IMAP,
        },
        SMTP: {
          ...DEFAULT_PROTOCOL_VALUES.SMTP,
          ...connectedAccount.connectionParameters?.SMTP,
        },
        CALDAV: {
          ...DEFAULT_PROTOCOL_VALUES.CALDAV,
          ...connectedAccount.connectionParameters?.CALDAV,
        },
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
    ): (keyof ImapSmtpCaldavAccountInput)[] => {
      const isProtocolConfiguredCheckFunction = isEditing
        ? isProtocolConfiguredForUpdate
        : isProtocolConfigured;

      return ACCOUNT_TYPES.filter((protocol) => {
        const protocolConfig = values[protocol];
        return (
          isDefined(protocolConfig) &&
          isProtocolConfiguredCheckFunction(protocolConfig)
        );
      });
    },
    [watchedValues, isEditing],
  );

  const isValid = useMemo(() => {
    return (
      Boolean(watchedValues.handle?.trim()) &&
      getConfiguredProtocols().length > 0
    );
  }, [getConfiguredProtocols, watchedValues.handle]);

  const handleSave = useCallback(
    async (formValues: ConnectionFormData): Promise<void> => {
      const configuredProtocols = getConfiguredProtocols(formValues);

      if (configuredProtocols.length === 0) {
        throw new Error('At least one protocol must be configured');
      }

      const connectionParameters: Partial<
        Record<keyof ImapSmtpCaldavAccountInput, ConnectionParametersInput>
      > = {};
      configuredProtocols.forEach((protocol) => {
        const protocolConfig = formValues[protocol];
        if (isDefined(protocolConfig)) {
          const { password, ...withoutPassword } = protocolConfig;
          const hasPassword = isNonEmptyString(password);

          connectionParameters[protocol] = hasPassword
            ? { ...withoutPassword, password }
            : withoutPassword;
        }
      });

      try {
        const { data } = await saveConnection({
          variables: {
            ...(isEditing && connectedAccountId
              ? { id: connectedAccountId }
              : {}),
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
