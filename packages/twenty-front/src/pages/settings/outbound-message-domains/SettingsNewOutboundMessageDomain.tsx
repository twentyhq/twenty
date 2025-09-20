import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ApolloError } from '@apollo/client';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  OutboundMessageDomainDriver,
  useCreateOutboundMessageDomainMutation,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import {
  settingsOutboundMessageDomainFormSchema,
  type SettingsOutboundMessageDomainFormValues,
} from '~/pages/settings/outbound-message-domains/validation-schemas/settingsOutboundMessageDomainFormSchema';

type FieldErrors = Partial<
  Record<keyof SettingsOutboundMessageDomainFormValues, string>
>;
export const SettingsNewOutboundMessageDomain = () => {
  const navigate = useNavigateSettings();
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [formValues, setFormValues] =
    useState<SettingsOutboundMessageDomainFormValues>({
      driver: OutboundMessageDomainDriver.AWS_SES,
      domain: '',
    });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createOutboundMessageDomain] =
    useCreateOutboundMessageDomainMutation();

  const validateForm = (): boolean => {
    const result =
      settingsOutboundMessageDomainFormSchema.safeParse(formValues);

    if (!result.success) {
      setFieldErrors(result.error?.flatten().fieldErrors as FieldErrors);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleFieldChange = (
    field: keyof SettingsOutboundMessageDomainFormValues,
    value: string | OutboundMessageDomainDriver,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (isDefined(fieldErrors[field])) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const canSave = !isSubmitting;

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createOutboundMessageDomain({
        variables: {
          input: {
            domain: formValues.domain,
            driver: formValues.driver,
          },
        },
        onCompleted: (data) => {
          enqueueSuccessSnackBar({
            message: t`Outbound message domain created successfully. Please verify the domain to start using it.`,
          });
          if (!data.createOutboundMessageDomain?.id) return;

          navigate(SettingsPath.OutboundMessageDomainDetail, {
            domainId: data.createOutboundMessageDomain.id,
          });
        },
        onError: (error) => {
          enqueueErrorSnackBar({
            apolloError: error instanceof ApolloError ? error : undefined,
          });
        },
      });
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SubMenuTopBarContainer
      title="New Outbound Message Domain"
      actionButton={
        <SaveAndCancelButtons
          onCancel={() => navigate(SettingsPath.Domains)}
          onSave={handleSave}
          isSaveDisabled={!canSave}
        />
      }
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Domains</Trans>,
          href: getSettingsPath(SettingsPath.Domains),
        },
        {
          children: <Trans>Outbound Message Domains</Trans>,
          href: getSettingsPath(SettingsPath.Domains),
        },
        { children: <Trans>New Outbound Message Domain</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Domain`}
            description={t`The domain name you want to use for sending outbound emails`}
          />
          <SettingsTextInput
            instanceId="outbound-message-domain"
            autoFocus
            autoComplete="off"
            value={formValues.domain}
            onChange={(value) => handleFieldChange('domain', value)}
            fullWidth
            placeholder="yourdomain.com"
            error={fieldErrors.domain}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
