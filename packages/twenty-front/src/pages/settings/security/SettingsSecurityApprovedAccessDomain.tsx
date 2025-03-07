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
import { z } from 'zod';
import { H2Title, Section } from 'twenty-ui';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useCreateApprovedAccessDomainMutation } from '~/generated/graphql';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';

export const SettingsSecurityApprovedAccessDomain = () => {
  const navigate = useNavigateSettings();

  const { t } = useLingui();

  const { enqueueSnackBar } = useSnackBar();

  const [createApprovedAccessDomain] = useCreateApprovedAccessDomainMutation();

  const form = useForm<{ domain: string; email: string }>({
    mode: 'onSubmit',
    resolver: zodResolver(
      z
        .object({
          domain: z
            .string()
            .regex(
              /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])\.[a-zA-Z]{2,}$/,
              {
                message: t`Domains have to be smaller than 256 characters, cannot contain spaces and cannot contain any special characters.`,
              },
            )
            .max(256),
          email: z.string().min(1, {
            message: t`Email cannot be empty`,
          }),
        })
        .strict(),
    ),
    defaultValues: {
      email: '',
      domain: '',
    },
  });

  const domain = form.watch('domain');

  const handleSave = async () => {
    try {
      createApprovedAccessDomain({
        variables: {
          input: {
            domain: form.getValues('domain'),
            email: form.getValues('email') + '@' + form.getValues('domain'),
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
    <form onSubmit={form.handleSubmit(handleSave)}>
      <SubMenuTopBarContainer
        title="New Approved Access Domain"
        actionButton={
          <SaveAndCancelButtons
            onCancel={() => navigate(SettingsPath.Security)}
            isSaveDisabled={form.formState.isSubmitting}
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
            <H2Title
              title={t`Domain`}
              description={t`The name of your Domain`}
            />
            <Controller
              name="domain"
              control={form.control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <TextInputV2
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
              control={form.control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <TextInputV2
                  autoComplete="off"
                  value={value.split('@')[0]}
                  onChange={onChange}
                  fullWidth
                  error={error?.message}
                  rightAdornment={`@${domain.length !== 0 ? domain : 'your-domain.com'}`}
                />
              )}
            />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </form>
  );
};
