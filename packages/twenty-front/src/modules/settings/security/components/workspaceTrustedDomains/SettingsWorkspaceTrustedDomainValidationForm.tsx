import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { domainSchema } from '@/settings/security/validation-schemas/domainSchema';
import { Trans } from '@lingui/react/macro';
import { TextInput } from '@/ui/input/components/TextInput';
import { z } from 'zod';
import { H2Title, Section } from 'twenty-ui';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  useGetAllWorkspaceTrustedDomainsQuery,
  useSendTrustedDomainVerificationEmailMutation,
  WorkspaceTrustedDomain,
} from '~/generated/graphql';
import { useState } from 'react';
import { isDefined } from 'twenty-shared';
import { useParams } from 'react-router-dom';

export const SettingsWorkspaceTrustedDomainValidationForm = () => {
  const navigate = useNavigateSettings();

  const { enqueueSnackBar } = useSnackBar();
  const params = useParams();

  useGetAllWorkspaceTrustedDomainsQuery({
    onCompleted: (data) => {
      if (
        isDefined(params.trustedDomainId) &&
        data.getAllWorkspaceTrustedDomains.length > 0
      ) {
        const workspaceTrustedDomain = data.getAllWorkspaceTrustedDomains.find(
          (workspaceTrustedDomain) =>
            workspaceTrustedDomain.id === params.trustedDomainId,
        );
        if (isDefined(workspaceTrustedDomain)) {
          setCurrentWorkspaceTrustedDomain(workspaceTrustedDomain);
          formConfig.setValue('domain', workspaceTrustedDomain.domain);
        }
      }
    },
  });

  const [sendTrustedDomainVerificationEmail] =
    useSendTrustedDomainVerificationEmailMutation();

  const [currentWorkspaceTrustedDomain, setCurrentWorkspaceTrustedDomain] =
    useState<WorkspaceTrustedDomain | undefined>();

  const formConfig = useForm<{ domain: string; email: string }>({
    mode: 'onChange',
    resolver: zodResolver(
      z
        .object({
          domain: domainSchema,
          email: z.string(),
        })
        .strict(),
    ),
    defaultValues: {
      email: '',
      domain: '',
    },
  });

  const sendWorkspaceTrustedDomainVerificationEmailHandler = (
    workspaceTrustDomain: WorkspaceTrustedDomain,
  ) => {
    sendTrustedDomainVerificationEmail({
      variables: {
        input: {
          email:
            formConfig.getValues('email') + '@' + workspaceTrustDomain.domain,
          trustedDomainId: workspaceTrustDomain.id,
        },
      },
      onCompleted: () => {
        enqueueSnackBar('Email sent successfully', {
          variant: SnackBarVariant.Success,
        });
      },
      onError: (error) => {
        enqueueSnackBar((error as Error).message, {
          variant: SnackBarVariant.Error,
        });
      },
    });
  };

  const handleSend = async () => {
    try {
      if (!currentWorkspaceTrustedDomain) {
        return createWorkspaceTrustedDomainHandler(
          formConfig.getValues('domain'),
        );
      }

      if (
        currentWorkspaceTrustedDomain &&
        !currentWorkspaceTrustedDomain.isValidated
      ) {
        return sendWorkspaceTrustedDomainVerificationEmailHandler(
          currentWorkspaceTrustedDomain,
        );
      }
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title="New Trusted Email Domain"
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!formConfig.formState.isValid}
          onCancel={() => navigate(SettingsPath.Security)}
          onSave={handleSend}
        />
      }
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Security</Trans>,
          href: getSettingsPath(SettingsPath.Security),
        },
        { children: <Trans>Validate Trusted Domain</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title="Email verification"
            description="We will send your a link to verify domain ownership"
          />
          <Controller
            name="email"
            control={formConfig.control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                autoComplete="off"
                label="Email"
                value={value.split('@')[0]}
                onChange={onChange}
                fullWidth
              />
            )}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
