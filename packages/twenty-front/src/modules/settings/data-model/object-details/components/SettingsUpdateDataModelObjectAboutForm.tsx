import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsDataModelObjectAboutForm } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import { getDirtyValues } from '@/settings/data-model/utils/getFormDirtyFields';
import {
  SettingsDataModelObjectAboutFormValues,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { settingsUpdateObjectInputSchema } from '@/settings/data-model/validation-schemas/settingsUpdateObjectInputSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { ZodError, isDirty } from 'zod';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { updatedObjectNamePluralState } from '~/pages/settings/data-model/states/updatedObjectNamePluralState';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

type SettingsUpdateDataModelObjectAboutFormProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const SettingsUpdateDataModelObjectAboutForm = ({
  objectMetadataItem,
}: SettingsUpdateDataModelObjectAboutFormProps) => {
  const navigate = useNavigateSettings();
  const { enqueueSnackBar } = useSnackBar();
  const setUpdatedObjectNamePlural = useSetRecoilState(
    updatedObjectNamePluralState,
  );
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const formConfig = useForm<SettingsDataModelObjectAboutFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsDataModelObjectAboutFormSchema),
  });

  const getUpdatePayload = (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    const dirtyFields = getDirtyValues(
      formConfig.formState.dirtyFields,
      formValues,
    );
    const shouldComputeNamesFromLabels =
      dirtyFields.isLabelSyncedWithName === true ||
      objectMetadataItem?.isLabelSyncedWithName === true;

    if (shouldComputeNamesFromLabels) {
      const nameSingular = isDefined(dirtyFields.labelSingular)
        ? computeMetadataNameFromLabel(dirtyFields.labelSingular)
        : undefined;
      const namePlural = isDefined(dirtyFields.labelPlural)
        ? computeMetadataNameFromLabel(dirtyFields.labelPlural)
        : undefined;

      return settingsUpdateObjectInputSchema.parse({
        ...formValues,
        namePlural,
        nameSingular,
      });
    }

    return settingsUpdateObjectInputSchema.parse(formValues);
  };

  const handleSave = async (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    if (!isDirty) {
      return;
    }
    try {
      const updatePayload = getUpdatePayload(formValues);
      const objectNamePluralForRedirection =
        updatePayload.namePlural ?? objectMetadataItem.namePlural;

      setUpdatedObjectNamePlural(objectNamePluralForRedirection);

      await updateOneObjectMetadataItem({
        idToUpdate: objectMetadataItem.id,
        updatePayload,
      });

      formConfig.reset(undefined, { keepValues: true });

      navigate(SettingsPath.ObjectDetail, {
        objectNamePlural: objectNamePluralForRedirection,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof ZodError) {
        enqueueSnackBar(error.issues[0].message, {
          variant: SnackBarVariant.Error,
        });
      } else {
        enqueueSnackBar((error as Error).message, {
          variant: SnackBarVariant.Error,
        });
      }
    }
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SettingsDataModelObjectAboutForm
        handleSave={handleSave}
        disableEdition={!objectMetadataItem.isCustom}
        objectMetadataItem={objectMetadataItem}
      />
    </FormProvider>
  );
};
