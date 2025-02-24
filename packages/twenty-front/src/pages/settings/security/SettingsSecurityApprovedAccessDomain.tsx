import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
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
    mode: 'onSubmit',
    resolver: zodResolver(
      z
        .object({
          domain: z
            .string()
            .regex(
              /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
              {
                message: t`Invalid domain. Domains have to be smaller than 256 characters in length, cannot be IP addresses, cannot contain spaces, cannot contain any special characters such as _~\`!@#$%^*()=+{}[]|\\;:'",<>/? and cannot begin or end with a '-' character.`,
              },
            )
            .max(256),
          email: z.string().min(1, {
            message: t`Email can not be empty`,
          }),
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
      if (!formConfig.formState.isValid) {
        return;
      }
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
          onCancel={() => navigate(SettingsPath.Security)}
          onSave={formConfig.handleSubmit(handleSave)}
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
          <H2Title title={t`Domain`} description={t`The name of your Domain`} />
          <Controller
            name="domain"
            control={formConfig.control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextInput
                autoComplete="off"
                value={value}
                onChange={(domain: string) => {
                  onChange(domain);
                }}
                fullWidth
                placeholder="yourdomain.com"
                error={error?.message}
              />
            )}
          />
        </Section>
        <Section>
          <H2Title
            title={t`Email verification`}
            description={t`We will send your a link to verify domain ownership`}
          />
          <Controller
            name="email"
            control={formConfig.control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextInput
                autoComplete="off"
                value={value.split('@')[0]}
                onChange={onChange}
                fullWidth
                error={error?.message}
              />
            )}
          />
          {domain}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
