import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ApolloError } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsAIAgentForm } from './forms/components/SettingsAIAgentForm';
import {
  SettingsAIAgentFormValues,
  settingsAIAgentFormSchema,
} from './validation-schemas/settingsAIAgentFormSchema';

export const SettingsNewAgent = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [isLoading, setIsLoading] = useState(false);

  const formConfig = useForm<SettingsAIAgentFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(settingsAIAgentFormSchema),
    defaultValues: {
      isCustom: true,
    },
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const handleSave = async (formValues: SettingsAIAgentFormValues) => {
    try {
      setIsLoading(true);
      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...formConfig}
    >
      <SubMenuTopBarContainer
        title={t`New Agent`}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`AI`,
            href: getSettingsPath(SettingsPath.AI),
          },
          { children: t`New` },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isLoading={isLoading}
            isCancelDisabled={isSubmitting}
            onCancel={() => navigate(SettingsPath.AI)}
            onSave={formConfig.handleSubmit(handleSave)}
          />
        }
      >
        <SettingsPageContainer>
          <Section>
            <H2Title
              title={t`About`}
              description={t`Define the name, description, and configuration of your AI agent`}
            />
            <SettingsAIAgentForm onNewDirtyField={() => formConfig.trigger()} />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
