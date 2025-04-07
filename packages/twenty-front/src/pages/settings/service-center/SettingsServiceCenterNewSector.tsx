/* eslint-disable react/jsx-props-no-spreading */
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ThemeColor } from 'twenty-ui/theme';
import { z } from 'zod';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsSectorFormSchema,
  SettingsServiceCenterSectorAboutForm,
} from '@/settings/service-center/sectors/components/SettingsServiceCenterSectorAboutForm';
import { useCreateSector } from '@/settings/service-center/sectors/hooks/useCreateSector';
import { useSelectSettingsFormInitialValues } from '@/settings/service-center/sectors/hooks/useSelectSettingsFormInitialValues';
import { CreateSectorInput } from '@/settings/service-center/sectors/types/CreateSectorInput';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useRecoilValue } from 'recoil';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const newSectorFormSchema = SettingsSectorFormSchema.extend({
  workspaceId: z.string(),
});

type SettingsSectorSchemaValues = z.infer<typeof newSectorFormSchema>;

export const SettingsServiceCenterNewSector = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();
  const { createSector } = useCreateSector();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { DEFAULT_OPTION } = useSelectSettingsFormInitialValues();

  const formConfig = useForm<SettingsSectorSchemaValues>({
    mode: 'onTouched',
    resolver: zodResolver(newSectorFormSchema),
    defaultValues: {
      icon: '',
      name: '',
      workspaceId: currentWorkspace?.id,
      topics: [DEFAULT_OPTION],
    },
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const settingsServiceCenterSectorsPagePath = getSettingsPath(
    SettingsPath.ServiceCenterSectors,
  );

  const onSave = async (formValue: SettingsSectorSchemaValues) => {
    try {
      const sectorData: CreateSectorInput = {
        icon: formValue.icon,
        name: formValue.name,
        topics: formValue.topics.map((topic: any) => ({
          ...topic,
          color: topic.color as ThemeColor,
        })),
        workspaceId: formValue.workspaceId,
      };

      await createSector(sectorData);
      navigate(settingsServiceCenterSectorsPagePath);
    } catch (err) {
      enqueueSnackBar((err as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={'Sectors'}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          isCancelDisabled={isSubmitting}
          onCancel={() => navigate(settingsServiceCenterSectorsPagePath)}
          onSave={formConfig.handleSubmit(onSave)}
        />
      }
      links={[
        {
          children: 'Sectors',
          href: getSettingsPath(SettingsPath.ServiceCenterSectors),
        },
        { children: 'New sector' },
      ]}
    >
      <FormProvider {...formConfig}>
        <SettingsPageContainer>
          <SettingsServiceCenterSectorAboutForm />
        </SettingsPageContainer>
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
