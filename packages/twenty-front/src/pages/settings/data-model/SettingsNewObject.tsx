import { useCreateOneObjectMetadataItem } from '@/object-metadata/hooks/useCreateOneObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SETTINGS_OBJECT_MODEL_IS_LABEL_SYNCED_WITH_NAME_LABEL_DEFAULT_VALUE } from '@/settings/constants/SettingsObjectModel';
import { SettingsDataModelObjectAboutForm } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import { getConflictingObjectMetadataItem } from '@/settings/data-model/utils/getConflictingObjectMetadataItem';
import {
  type SettingsDataModelObjectAboutFormValues,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsNewObject = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const [isLoading, setIsLoading] = useState(false);
  const { createOneObjectMetadataItem } = useCreateOneObjectMetadataItem();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const formConfig = useForm<SettingsDataModelObjectAboutFormValues>({
    mode: 'onChange',
    resolver: zodResolver(settingsDataModelObjectAboutFormSchema),
    defaultValues: {
      isLabelSyncedWithName:
        SETTINGS_OBJECT_MODEL_IS_LABEL_SYNCED_WITH_NAME_LABEL_DEFAULT_VALUE,
    },
  });

  const nameSingular = formConfig.watch('nameSingular');
  const namePlural = formConfig.watch('namePlural');

  const conflictingObjectMetadataItem = getConflictingObjectMetadataItem({
    objectMetadataItems,
    nameSingular,
    namePlural,
  });

  const hasNameConflict = isDefined(conflictingObjectMetadataItem);

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting && !hasNameConflict;

  const handleSave = async (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    setIsLoading(true);

    const result = await createOneObjectMetadataItem(formValues);

    if (result.status === 'successful') {
      const response = result.response.data;
      navigate(
        response ? SettingsPath.ObjectDetail : SettingsPath.Objects,
        response
          ? { objectNamePlural: response.createOneObject.namePlural }
          : undefined,
      );
    }

    setIsLoading(false);
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SubMenuTopBarContainer
        title={t`New Object`}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`Objects`,
            href: getSettingsPath(SettingsPath.Objects),
          },
          { children: t`New` },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isLoading={isLoading}
            isCancelDisabled={isSubmitting}
            onCancel={() => navigate(SettingsPath.Objects)}
            onSave={formConfig.handleSubmit(handleSave)}
          />
        }
      >
        <SettingsPageContainer>
          <Section>
            <H2Title
              title={t`About`}
              description={t`Define the name and description of your object`}
            />
            <SettingsDataModelObjectAboutForm
              onNewDirtyField={() => formConfig.trigger()}
              conflictingObjectMetadataItem={
                !isLoading ? conflictingObjectMetadataItem : undefined
              }
            />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
