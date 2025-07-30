import { ApolloError } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { FormProvider, useForm } from 'react-hook-form';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  CreateAgentInput,
  useCreateOneAgentMutation,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

import { SettingsAIAgentForm } from './forms/components/SettingsAIAgentForm';
import {
  settingsAIAgentFormSchema,
  SettingsAIAgentFormValues,
} from './validation-schemas/settingsAIAgentFormSchema';

export const SettingsNewAgent = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const [createOneAgentMutation] = useCreateOneAgentMutation();
  const { enqueueErrorSnackBar } = useSnackBar();

  const formConfig = useForm<SettingsAIAgentFormValues>({
    mode: 'onChange',
    resolver: zodResolver(settingsAIAgentFormSchema),
    defaultValues: {
      name: '',
      label: '',
      description: '',
      icon: 'IconRobot',
      modelId: 'auto',
      role: '',
      prompt: '',
      isCustom: true,
    },
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const handleSave = async (formData: SettingsAIAgentFormValues) => {
    try {
      const input: CreateAgentInput = {
        name: formData.name,
        label: formData.label,
        description: formData.description || undefined,
        icon: formData.icon || undefined,
        modelId: formData.modelId,
        roleId: formData.role || undefined,
        prompt: formData.prompt,
        isCustom: formData.isCustom,
      };

      await createOneAgentMutation({
        variables: { input },
      });
      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={t`New Agent`}
      actionButton={
        <SaveAndCancelButtons
          onSave={formConfig.handleSubmit(handleSave)}
          onCancel={() => navigate(SettingsPath.AI)}
          isSaveDisabled={!canSave}
          isLoading={isSubmitting}
          isCancelDisabled={isSubmitting}
        />
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`AI`, href: getSettingsPath(SettingsPath.AI) },
        { children: t`New Agent` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`New Agent`}
            description={t`Create a new AI agent`}
          />
          <FormProvider
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...formConfig}
          >
            <SettingsAIAgentForm />
          </FormProvider>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
