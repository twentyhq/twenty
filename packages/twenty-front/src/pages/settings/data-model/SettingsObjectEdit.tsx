/* eslint-disable react/jsx-props-no-spreading */

import { zodResolver } from '@hookform/resolvers/zod';
import pick from 'lodash.pick';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title, IconArchive } from 'twenty-ui';
import { z } from 'zod';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsDataModelObjectAboutForm,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import { settingsDataModelObjectIdentifiersFormSchema } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectIdentifiersForm';
import { SettingsDataModelObjectSettingsFormCard } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectSettingsFormCard';
import { settingsUpdateObjectInputSchema } from '@/settings/data-model/validation-schemas/settingsUpdateObjectInputSchema';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';

const objectEditFormSchema = z
  .object({})
  .merge(settingsDataModelObjectAboutFormSchema)
  .merge(settingsDataModelObjectIdentifiersFormSchema);

type SettingsDataModelObjectEditFormValues = z.infer<
  typeof objectEditFormSchema
>;

export const SettingsObjectEdit = () => {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const { objectSlug = '' } = useParams();
  const { findActiveObjectMetadataItemBySlug } =
    useFilteredObjectMetadataItems();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);

  const settingsObjectsPagePath = getSettingsPagePath(SettingsPath.Objects);

  const formConfig = useForm<SettingsDataModelObjectEditFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(objectEditFormSchema),
  });

  useEffect(() => {
    if (!activeObjectMetadataItem) navigate(AppPath.NotFound);
  }, [activeObjectMetadataItem, navigate]);

  if (!activeObjectMetadataItem) return null;

  const { isDirty, isValid, isSubmitting } = formConfig.formState;
  const canSave = isDirty && isValid && !isSubmitting;

  const handleSave = async (
    formValues: SettingsDataModelObjectEditFormValues,
  ) => {
    const dirtyFieldKeys = Object.keys(
      formConfig.formState.dirtyFields,
    ) as (keyof SettingsDataModelObjectEditFormValues)[];

    try {
      await updateOneObjectMetadataItem({
        idToUpdate: activeObjectMetadataItem.id,
        updatePayload: settingsUpdateObjectInputSchema.parse(
          pick(formValues, dirtyFieldKeys),
        ),
      });

      navigate(
        `${settingsObjectsPagePath}/${getObjectSlug({
          ...formValues,
          namePlural: formValues.labelPlural,
        })}`,
      );
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const handleDisable = async () => {
    await updateOneObjectMetadataItem({
      idToUpdate: activeObjectMetadataItem.id,
      updatePayload: { isActive: false },
    });
    navigate(settingsObjectsPagePath);
  };

  return (
    <RecordFieldValueSelectorContextProvider>
      <FormProvider {...formConfig}>
        <SubMenuTopBarContainer
          title="Edit"
          links={[
            {
              children: 'Workspace',
              href: getSettingsPagePath(SettingsPath.Workspace),
            },
            {
              children: 'Objects',
              href: settingsObjectsPagePath,
            },
            {
              children: activeObjectMetadataItem.labelPlural,
              href: `${settingsObjectsPagePath}/${objectSlug}`,
            },
            { children: 'Edit Object' },
          ]}
          actionButton={
            activeObjectMetadataItem.isCustom && (
              <SaveAndCancelButtons
                isSaveDisabled={!canSave}
                isCancelDisabled={isSubmitting}
                onCancel={() =>
                  navigate(`${settingsObjectsPagePath}/${objectSlug}`)
                }
                onSave={formConfig.handleSubmit(handleSave)}
              />
            )
          }
        >
          <SettingsPageContainer>
            <Section>
              <H2Title
                title="About"
                description="Name in both singular (e.g., 'Invoice') and plural (e.g., 'Invoices') forms."
              />
              <SettingsDataModelObjectAboutForm
                disabled={!activeObjectMetadataItem.isCustom}
                disableNameEdit
                objectMetadataItem={activeObjectMetadataItem}
              />
            </Section>
            <Section>
              <H2Title
                title="Settings"
                description="Choose the fields that will identify your records"
              />
              <SettingsDataModelObjectSettingsFormCard
                objectMetadataItem={activeObjectMetadataItem}
              />
            </Section>
            <Section>
              <H2Title title="Danger zone" description="Deactivate object" />
              <Button
                Icon={IconArchive}
                title="Deactivate"
                size="small"
                onClick={handleDisable}
              />
            </Section>
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      </FormProvider>
    </RecordFieldValueSelectorContextProvider>
  );
};
