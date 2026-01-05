import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { computeUpdatedNavigationMemorizedUrlAfterObjectNamePluralChange } from '@/settings/data-model/object-details/utils/computeUpdatedNavigationMemorizedUrlAfterObjectNamePluralChange.util';
import { SettingsDataModelObjectAboutForm } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import {
  type SettingsDataModelObjectAboutFormValues,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { updatedObjectNamePluralState } from '~/pages/settings/data-model/states/updatedObjectNamePluralState';

type SettingsUpdateDataModelObjectAboutFormProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const SettingsUpdateDataModelObjectAboutForm = ({
  objectMetadataItem,
}: SettingsUpdateDataModelObjectAboutFormProps) => {
  const readonly = isObjectMetadataReadOnly({
    objectMetadataItem,
  });
  const navigate = useNavigateSettings();
  const setUpdatedObjectNamePlural = useSetRecoilState(
    updatedObjectNamePluralState,
  );
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
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
    if (readonly) {
      return;
    }

    if (!(Object.keys(formConfig.formState.dirtyFields).length > 0)) {
      return;
    }

    const objectNamePluralForRedirection =
      formValues.namePlural ?? objectMetadataItem.namePlural;

    if (readonly) {
      return;
    }

    setUpdatedObjectNamePlural(objectNamePluralForRedirection);
    const updateResult = await updateObjectMetadata(formValues);

    if (updateResult.status === 'failed') {
      return;
    }

    const updatedObject = updateResult.response;

    if (formValues.isLabelSyncedWithName !== isLabelSyncedWithName) {
      formConfig.reset({
        description,
        icon: icon ?? undefined,
        isLabelSyncedWithName: formValues.isLabelSyncedWithName,
        labelPlural: updatedObject?.data?.updateOneObject.labelPlural,
        labelSingular: updatedObject?.data?.updateOneObject.labelSingular,
        namePlural: updatedObject?.data?.updateOneObject.namePlural,
        nameSingular: updatedObject?.data?.updateOneObject.nameSingular,
      });
    } else {
      formConfig.reset(undefined, { keepValues: true });
    }

    navigate(SettingsPath.ObjectDetail, {
      objectNamePlural: objectNamePluralForRedirection,
    });

    const updatedObjectNamePlural =
      updatedObject?.data?.updateOneObject.namePlural;

    if (!isDefined(updatedObjectNamePlural)) {
      return;
    }

    setNavigationMemorizedUrl((previousNavigationMemorizedUrl) =>
      computeUpdatedNavigationMemorizedUrlAfterObjectNamePluralChange(
        previousNavigationMemorizedUrl,
        objectMetadataItem.namePlural,
        updatedObjectNamePlural,
      ),
    );
  };

  const updateObjectMetadata = async (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    const updatePayload = { ...formValues };

    if (!objectMetadataItem.isCustom) {
      const {
        nameSingular: _nameSingular,
        namePlural: _namePlural,
        isLabelSyncedWithName: _isLabelSyncedWithName,
        ...payloadWithoutNames
      } = updatePayload;

      return await updateOneObjectMetadataItem({
        idToUpdate: objectMetadataItem.id,
        updatePayload: payloadWithoutNames,
      });
    }

    return await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload,
    });
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SettingsDataModelObjectAboutForm
        onNewDirtyField={() => formConfig.handleSubmit(handleSave)()}
        disableEdition={readonly}
        objectMetadataItem={objectMetadataItem}
      />
    </FormProvider>
  );
};
