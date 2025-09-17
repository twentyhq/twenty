import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { CREATE_OUTBOUND_MESSAGE_DOMAIN } from '@/settings/outbound-message-domains/graphql/mutations/createOutboundMessageDomain';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ApolloError, useMutation } from '@apollo/client';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { OutboundMessageDomainDriver } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import {
  settingsOutboundMessageDomainFormSchema,
  type SettingsOutboundMessageDomainFormValues,
} from '~/pages/settings/outbound-message-domains/validation-schemas/settingsOutboundMessageDomainFormSchema';

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

type FormValues = {
  domain: string;
  driver: OutboundMessageDomainDriver;
};

type FieldErrors = Partial<
  Record<keyof SettingsOutboundMessageDomainFormValues, string>
>;
export const SettingsNewOutboundMessageDomain = () => {
  const navigate = useNavigateSettings();
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [formValues, setFormValues] = useState<FormValues>({
    driver: OutboundMessageDomainDriver.AWS_SES,
    domain: '',
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createOutboundMessageDomain] = useMutation(
    CREATE_OUTBOUND_MESSAGE_DOMAIN,
  );

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
    field: keyof FormValues,
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
        onCompleted: () => {
          enqueueSuccessSnackBar({
            message: t`Outbound message domain created successfully. Please verify the domain to start using it.`,
          });
          navigate(SettingsPath.Domains);
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

  const driverOptions = [
    {
      label: 'AWS SES',
      value: OutboundMessageDomainDriver.AWS_SES,
    },
  ];

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
        <Section>
          <H2Title
            title={t`Email Provider`}
            description={t`Choose the email service provider for this domain`}
          />
          <Select
            dropdownId="outbound-message-domain-driver"
            value={formValues.driver}
            onChange={(value) => {
              if (isDefined(value)) {
                handleFieldChange(
                  'driver',
                  value as OutboundMessageDomainDriver,
                );
              }
            }}
            options={driverOptions}
          />
          {fieldErrors.driver && (
            <StyledErrorMessage>{fieldErrors.driver}</StyledErrorMessage>
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
