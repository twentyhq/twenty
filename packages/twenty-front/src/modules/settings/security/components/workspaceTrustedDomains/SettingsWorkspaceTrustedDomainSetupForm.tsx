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
import { useCreateWorkspaceTrustDomainMutation } from '~/generated/graphql';

export const SettingsWorkspaceTrustedDomainSetupForm = () => {
  const navigate = useNavigateSettings();

  const { enqueueSnackBar } = useSnackBar();

  const [createWorkspaceTrustDomain] = useCreateWorkspaceTrustDomainMutation();

  const formConfig = useForm<{ domain: string; email: string }>({
    mode: 'onChange',
    resolver: zodResolver(
      z
        .object({
          domain: domainSchema,
        })
        .strict(),
    ),
    defaultValues: {
      domain: '',
    },
  });

  const createWorkspaceTrustedDomainHandler = (domain: string) => {
    createWorkspaceTrustDomain({
      variables: {
        input: {
          domain,
        },
      },
      onCompleted: (workspaceTrustedDomain) => {
        if (workspaceTrustedDomain.createWorkspaceTrustedDomain.isValidated) {
          return navigate(SettingsPath.Security);
        }

        setCurrentWorkspaceTrustedDomain(
          workspaceTrustedDomain.createWorkspaceTrustedDomain,
        );
      },
      onError: (error) => {
        enqueueSnackBar((error as Error).message, {
          variant: SnackBarVariant.Error,
        });
      },
    });
  };

  const handleSave = async () => {
    try {
      if (!currentWorkspaceTrustedDomain) {
        return createWorkspaceTrustedDomainHandler(
          formConfig.getValues('domain'),
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
          onSave={handleSave}
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
        { children: <Trans>New Trusted Domain</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title="Domain" description="The name of your Domain" />
          <Controller
            name="domain"
            control={formConfig.control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                autoComplete="off"
                label="Domain"
                value={value}
                onChange={onChange}
                fullWidth
                placeholder="yourdomain.com"
              />
            )}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
