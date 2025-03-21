/* eslint-disable react/jsx-props-no-spreading */
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared';
import { z } from 'zod';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';

import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';

import { OBJECT_SETTINGS_WIDTH } from '@/settings/data-model/constants/ObjectSettings';
import {
  SettingsServiceCenterAgentAboutForm,
  SettingsServiceCenterAgentFormSchema,
} from '@/settings/service-center/agents/components/SettingsServiceCenterAgentAboutForm';
import { useCreateAgent } from '@/settings/service-center/agents/hooks/useCreateAgent';
import { CreateAgentInput } from '@/settings/service-center/agents/types/CreateAgentInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type SettingsNewAgentSchemaValues = z.infer<
  typeof SettingsServiceCenterAgentFormSchema
>;

const StyledDiv = styled.div<{
  width?: number;
}>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(6, 8, 8)};
  width: ${({ width }) => {
    if (isDefined(width)) {
      return width + 'px';
    }
    if (useIsMobile()) {
      return 'unset';
    }
    return OBJECT_SETTINGS_WIDTH + 'px';
  }};
  padding-bottom: ${({ theme }) => theme.spacing(20)};
`;

export const SettingsServiceCenterNewAgent = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();
  const { createAgent } = useCreateAgent();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  // const { refetch: refetchMembers } = useFindManyRecords<WorkspaceMember>({
  //   objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  // });

  const formConfig = useForm<SettingsNewAgentSchemaValues>({
    mode: 'onTouched',
    resolver: zodResolver(SettingsServiceCenterAgentFormSchema),
    defaultValues: {
      isAdmin: false,
      memberId: '',
      sectorIds: [],
      inboxesIds: [],
      workspaceId: currentWorkspace?.id,
    },
  });

  const { isValid, isSubmitting } = formConfig.formState;

  const canSave = isValid && !isSubmitting;

  const settingsServiceCenterAgentsPagePath = getSettingsPath(
    SettingsPath.ServiceCenterAgents,
  );

  const onSave = async (formValue: SettingsNewAgentSchemaValues) => {
    try {
      const agentData: CreateAgentInput = {
        isAdmin: formValue.isAdmin,
        memberId: formValue.memberId,
        sectorIds: formValue.sectorIds,
        inboxesIds: formValue.inboxesIds,
        workspaceId: formValue.workspaceId,
      };

      await createAgent(agentData);
      // refetchMembers();
      navigate(settingsServiceCenterAgentsPagePath);
    } catch (err) {
      enqueueSnackBar((err as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={'Agents'}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          isCancelDisabled={isSubmitting}
          onCancel={() => navigate(settingsServiceCenterAgentsPagePath)}
          onSave={formConfig.handleSubmit(onSave)}
        />
      }
      links={[
        {
          children: 'Agents',
          href: getSettingsPath(SettingsPath.ServiceCenterAgents),
        },
        { children: 'New Agent' },
      ]}
    >
      <FormProvider {...formConfig}>
        <StyledDiv>
          <SettingsServiceCenterAgentAboutForm />
        </StyledDiv>
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
