import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { useCreateOneObjectMetadataItem } from '@/object-metadata/hooks/useCreateOneObjectMetadataItem';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SETTINGS_OBJECT_MODEL_IS_LABEL_SYNCED_WITH_NAME_LABEL_DEFAULT_VALUE } from '@/settings/constants/SettingsObjectModel';
import { SettingsDataModelObjectAboutForm } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import {
  SettingsDataModelObjectAboutFormValues,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ApolloError } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsNewObject = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [isLoading, setIsLoading] = useState(false);
  const { createOneObjectMetadataItem } = useCreateOneObjectMetadataItem();

  const formConfig = useForm<SettingsDataModelObjectAboutFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(settingsDataModelObjectAboutFormSchema),
    defaultValues: {
      isLabelSyncedWithName:
        SETTINGS_OBJECT_MODEL_IS_LABEL_SYNCED_WITH_NAME_LABEL_DEFAULT_VALUE,
    },
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const handleSave = async (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    try {
      setIsLoading(true);
      const { data: response } = await createOneObjectMetadataItem(formValues);

      navigate(
        response ? SettingsPath.ObjectDetail : SettingsPath.Objects,
        response
          ? { objectNamePlural: response.createOneObject.namePlural }
          : undefined,
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    } finally {
      setIsLoading(false);
    }
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
            />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
