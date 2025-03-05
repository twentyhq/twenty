import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsDataModelObjectAboutForm } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import {
  SettingsDataModelObjectAboutFormValues,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import { ZodError } from 'zod';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { updatedObjectNamePluralState } from '~/pages/settings/data-model/states/updatedObjectNamePluralState';

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

  const handleSave = async (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    if (!formConfig.formState.isDirty) {
      return;
    }

    const objectNamePluralForRedirection =
      formValues.namePlural ?? objectMetadataItem.namePlural;

    setUpdatedObjectNamePlural(objectNamePluralForRedirection);

    try {
      console.log({ formValues });
      await updateOneObjectMetadataItem({
        idToUpdate: objectMetadataItem.id,
        updatePayload: formValues,
      });

      formConfig.reset(undefined, { keepValues: true });

      navigate(SettingsPath.ObjectDetail, {
        objectNamePlural: objectNamePluralForRedirection,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
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
        onNewDirtyField={() => formConfig.handleSubmit(handleSave)()}
        disableEdition={!objectMetadataItem.isCustom}
        objectMetadataItem={objectMetadataItem}
      />
    </FormProvider>
  );
};
