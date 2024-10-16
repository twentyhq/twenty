import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { H2Title } from 'twenty-ui';
import { z } from 'zod';

import { useCreateOneObjectMetadataItem } from '@/object-metadata/hooks/useCreateOneObjectMetadataItem';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsDataModelObjectAboutForm,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import { settingsCreateObjectInputSchema } from '@/settings/data-model/validation-schemas/settingsCreateObjectInputSchema';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';

const newObjectFormSchema = settingsDataModelObjectAboutFormSchema;

type SettingsDataModelNewObjectFormValues = z.infer<typeof newObjectFormSchema>;

export const SettingsNewObject = () => {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const { createOneObjectMetadataItem, findManyRecordsCache } =
    useCreateOneObjectMetadataItem();

  const settingsObjectsPagePath = getSettingsPagePath(SettingsPath.Objects);

  const formConfig = useForm<SettingsDataModelNewObjectFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(newObjectFormSchema),
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const handleSave = async (
    formValues: SettingsDataModelNewObjectFormValues,
  ) => {
    try {
      const { data: response } = await createOneObjectMetadataItem(
        settingsCreateObjectInputSchema.parse(formValues),
      );

      navigate(
        response
          ? `${settingsObjectsPagePath}/${getObjectSlug(
              response.createOneObject,
            )}`
          : settingsObjectsPagePath,
      );

      await findManyRecordsCache();
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SubMenuTopBarContainer
        title="New Object"
        links={[
          {
            children: 'Workspace',
            href: getSettingsPagePath(SettingsPath.Workspace),
          },
          {
            children: 'Objects',
            href: settingsObjectsPagePath,
          },
          { children: 'New' },
        ]}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={isSubmitting}
            onCancel={() => navigate(settingsObjectsPagePath)}
            onSave={formConfig.handleSubmit(handleSave)}
          />
        }
      >
        <SettingsPageContainer>
          <Section>
            <H2Title
              title="About"
              description="Name in both singular (e.g., 'Invoice') and plural (e.g., 'Invoices') forms."
            />
            <SettingsDataModelObjectAboutForm />
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
