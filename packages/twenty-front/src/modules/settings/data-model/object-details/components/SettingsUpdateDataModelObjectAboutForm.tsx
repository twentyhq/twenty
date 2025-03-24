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
  const {
    description,
    icon,
    isLabelSyncedWithName,
    labelPlural,
    labelSingular,
    namePlural,
    nameSingular,
  } = objectMetadataItem;
  const formConfig = useForm<SettingsDataModelObjectAboutFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsDataModelObjectAboutFormSchema),
    defaultValues: {
      description,
      icon: icon ?? undefined,
      isLabelSyncedWithName,
      labelPlural,
      labelSingular,
      namePlural,
      nameSingular,
    },
  });

  const handleSave = async (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    if (!(Object.keys(formConfig.formState.dirtyFields).length > 0)) {
      return;
    }

    const objectNamePluralForRedirection =
      formValues.namePlural ?? objectMetadataItem.namePlural;

    try {
      setUpdatedObjectNamePlural(objectNamePluralForRedirection);

      await updateObjectMetadata(formValues);

      formConfig.reset(undefined, { keepValues: true });
      navigate(SettingsPath.ObjectDetail, {
        objectNamePlural: objectNamePluralForRedirection,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const updateObjectMetadata = async (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    const updatePayload = { ...formValues };

    if (!objectMetadataItem.isCustom) {
      const {
        nameSingular: _,
        namePlural: __,
        ...payloadWithoutNames
      } = updatePayload;

      return updateOneObjectMetadataItem({
        idToUpdate: objectMetadataItem.id,
        updatePayload: payloadWithoutNames,
      });
    }

    return updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload,
    });
  };

  const handleError = (error: unknown) => {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof ZodError) {
      enqueueSnackBar(error.issues[0].message, {
        variant: SnackBarVariant.Error,
      });
      return;
    }

    enqueueSnackBar((error as Error).message, {
      variant: SnackBarVariant.Error,
    });
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
