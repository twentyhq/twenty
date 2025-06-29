/* eslint-disable react/jsx-props-no-spreading */
import { zodResolver } from '@hookform/resolvers/zod';
import pick from 'lodash.pick';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsServiceCenterAgentAboutForm,
  SettingsServiceCenterAgentFormSchema,
} from '@/settings/service-center/agents/components/SettingsServiceCenterAgentAboutForm';
import { useFindAllAgents } from '@/settings/service-center/agents/hooks/useFindAllAgents';
import { useUpdateAgent } from '@/settings/service-center/agents/hooks/useUpdateAgent';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { UpdateWorkspaceAgentInput } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const editAgentFormSchema = z
  .object({})
  .merge(SettingsServiceCenterAgentFormSchema)
  .extend({
    id: z.string(),
    workspaceId: z.string(),
  });

type SettingsEditAgentSchemaValues = z.infer<typeof editAgentFormSchema>;

export const SettingsServiceCenterEditAgent = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const { agents } = useFindAllAgents();
  const { editAgent } = useUpdateAgent();

  const { agentSlug } = useParams<{ agentSlug?: string }>();

  const activeAgent = agents.find((agent) => agent.id === agentSlug);

  const settingsAgentsPagePath = getSettingsPath(
    SettingsPath.ServiceCenterAgents,
  );

  const formConfig = useForm<SettingsEditAgentSchemaValues>({
    mode: 'onTouched',
    resolver: zodResolver(editAgentFormSchema),
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const onSave = async (formValues: SettingsEditAgentSchemaValues) => {
    const dirtyFieldsKeys = Object.keys(
      formConfig.formState.dirtyFields,
    ) as (keyof SettingsEditAgentSchemaValues)[];

    try {
      // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
      if (activeAgent?.id) {
        const updatedValues: UpdateWorkspaceAgentInput = {
          ...pick(formValues, dirtyFieldsKeys),
          id: formValues.id,
          isAdmin: formValues.isAdmin,
          memberId: formValues.memberId,
          sectorIds: formValues.sectorIds,
          inboxesIds: formValues.inboxesIds,
        };

        await editAgent(updatedValues);

        navigate(settingsAgentsPagePath);
      }
    } catch (err) {
      enqueueSnackBar((err as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={'Agent'}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          isCancelDisabled={isSubmitting}
          onCancel={() => navigate(settingsAgentsPagePath)}
          onSave={formConfig.handleSubmit(onSave)}
        />
      }
      links={[
        {
          children: 'Edit',
          href: `${settingsAgentsPagePath}`,
        },
        { children: `${agentSlug}` },
      ]}
    >
      <FormProvider {...formConfig}>
        <SettingsPageContainer>
          <SettingsServiceCenterAgentAboutForm activeAgent={activeAgent} />
        </SettingsPageContainer>
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
