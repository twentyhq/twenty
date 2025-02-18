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

export const SettingsSecurityTrustedDomain = () => {
  const navigate = useNavigateSettings();

  const { enqueueSnackBar } = useSnackBar();

  const formConfig = useForm<{ domain: string; email: string }>({
    mode: 'onChange',
    resolver: zodResolver(
      z
        .object({
          domain: domainSchema,
          email: z.string().email(),
        })
        .strict(),
    ),
    defaultValues: {
      email: '',
      domain: '',
    },
  });

  const handleSave = async () => {
    try {
      console.log('>>>>>>>>>>>>>> send ', formConfig.getValues());
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
              value={value}
              onChange={(str) =>
                onChange(
                  `${str}@${formConfig.getValues('domain') ?? 'yourdomain.com'}`,
                )
              }
              fullWidth
            />
          )}
        />
      </Section>
    </SubMenuTopBarContainer>
  );
};
