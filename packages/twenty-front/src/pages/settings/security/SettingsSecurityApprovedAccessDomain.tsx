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
import { Trans, useLingui } from '@lingui/react/macro';
import { TextInput } from '@/ui/input/components/TextInput';
import { z } from 'zod';
import { H2Title, Section } from 'twenty-ui';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useCreateApprovedAccessDomainMutation } from '~/generated/graphql';

export const SettingsSecurityApprovedAccessDomain = () => {
  const navigate = useNavigateSettings();

  const { t } = useLingui();

  const { enqueueSnackBar } = useSnackBar();

  const [createApprovedAccessDomain] = useCreateApprovedAccessDomainMutation();

  const formConfig = useForm<{ domain: string; email: string }>({
    mode: 'onChange',
    resolver: zodResolver(
      z
        .object({
          domain: domainSchema,
          email: z.string().min(1),
        })
        .strict(),
    ),
    defaultValues: {
      email: '',
      domain: '',
    },
  });

  const domain = formConfig.watch('domain');

  const handleSave = async () => {
    try {
      createApprovedAccessDomain({
        variables: {
          input: {
            domain: formConfig.getValues('domain'),
            email:
              formConfig.getValues('email') +
              '@' +
              formConfig.getValues('domain'),
          },
        },
        onCompleted: () => {
          enqueueSnackBar(t`Domain added successfully.`, {
            variant: SnackBarVariant.Success,
          });
          navigate(SettingsPath.Security);
        },
        onError: (error) => {
          enqueueSnackBar((error as Error).message, {
            variant: SnackBarVariant.Error,
          });
        },
      });
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title="New Approved Access Domain"
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
        { children: <Trans>New Approved Access Domain</Trans> },
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
                value={value}
                onChange={(domain: string) => {
                  onChange(domain);
                }}
                fullWidth
                placeholder="yourdomain.com"
              />
            )}
          />
        </Section>
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
                value={value.split('@')[0]}
                onChange={onChange}
                fullWidth
              />
            )}
          />
          {domain}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
