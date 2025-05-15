/* eslint-disable react/jsx-props-no-spreading */
import { zodResolver } from '@hookform/resolvers/zod';
import pick from 'lodash.pick';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeColor } from 'twenty-ui/theme';
import { z } from 'zod';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';

import {
  SettingsSectorFormSchema,
  SettingsServiceCenterSectorAboutForm,
} from '@/settings/service-center/sectors/components/SettingsServiceCenterSectorAboutForm';
import { useFindAllSectors } from '@/settings/service-center/sectors/hooks/useFindAllSectors';
import { useUpdateSector } from '@/settings/service-center/sectors/hooks/useUpdateSector';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const editSectorFormSchema = z
  .object({})
  .merge(SettingsSectorFormSchema)
  .extend({
    id: z.string(),
    workspaceId: z.string(),
  });

type SettingsEditSectorSchemaValues = z.infer<typeof editSectorFormSchema>;

export const SettingsServiceCenterEditSector = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const { sectors } = useFindAllSectors();
  const { editSector } = useUpdateSector();

  const { sectorSlug } = useParams<{ sectorSlug?: string }>();

  const activeSector = sectors.find((sector) => sector.name === sectorSlug);

  const settingsSectorsPagePath = getSettingsPath(
    SettingsPath.ServiceCenterSectors,
  );

  const formConfig = useForm<SettingsEditSectorSchemaValues>({
    mode: 'onTouched',
    resolver: zodResolver(editSectorFormSchema),
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const onSave = async (formValues: SettingsEditSectorSchemaValues) => {
    const dirtyFieldsKeys = Object.keys(
      formConfig.formState.dirtyFields,
    ) as (keyof SettingsEditSectorSchemaValues)[];
    try {
      // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
      if (activeSector?.id) {
        const topicsData =
          formValues.topics?.length > 0
            ? formValues.topics.map((topic) => ({
                ...topic,
                color: topic.color as ThemeColor,
              }))
            : activeSector.topics.map((topic) => ({
                ...topic,
                color: topic.color as ThemeColor,
              }));
        const updatedValues = {
          ...pick(formValues, dirtyFieldsKeys),
          id: formValues.id,
          icon: formValues.icon || activeSector.icon,
          name: formValues.name || activeSector.name,
          topics: topicsData,
        };

        await editSector(updatedValues);

        navigate(settingsSectorsPagePath);
      }
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
          onCancel={() => navigate(settingsSectorsPagePath)}
          onSave={formConfig.handleSubmit(onSave)}
        />
      }
      links={[
        {
          children: 'Edit',
          href: `${settingsSectorsPagePath}`,
        },
        { children: `${sectorSlug}` },
      ]}
    >
      <FormProvider {...formConfig}>
        <SettingsPageContainer>
          <SettingsServiceCenterSectorAboutForm activeSector={activeSector} />
        </SettingsPageContainer>
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
