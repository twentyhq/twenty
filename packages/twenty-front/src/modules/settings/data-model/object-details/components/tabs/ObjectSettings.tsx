/* eslint-disable react/jsx-props-no-spreading */
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { Button, H2Title, IconArchive, Section } from 'twenty-ui';
import { ZodError, z } from 'zod';

import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import {
  IS_LABEL_SYNCED_WITH_NAME_LABEL,
  SettingsDataModelObjectAboutForm,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import { settingsDataModelObjectIdentifiersFormSchema } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectIdentifiersForm';
import { SettingsDataModelObjectSettingsFormCard } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectSettingsFormCard';
import { settingsUpdateObjectInputSchema } from '@/settings/data-model/validation-schemas/settingsUpdateObjectInputSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import pick from 'lodash.pick';
import { useSetRecoilState } from 'recoil';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { updatedObjectNamePluralState } from '~/pages/settings/data-model/states/updatedObjectNamePluralState';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

const objectEditFormSchema = z
  .object({})
  .merge(settingsDataModelObjectAboutFormSchema)
  .merge(settingsDataModelObjectIdentifiersFormSchema);

type SettingsDataModelObjectEditFormValues = z.infer<
  typeof objectEditFormSchema
>;

type ObjectSettingsProps = {
  objectMetadataItem: ObjectMetadataItem;
};

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
`;

const StyledFormSection = styled(Section)`
  padding-left: 0 !important;
`;

export const ObjectSettings = ({ objectMetadataItem }: ObjectSettingsProps) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueSnackBar } = useSnackBar();
  const setUpdatedObjectNamePlural = useSetRecoilState(
    updatedObjectNamePluralState,
  );

  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const formConfig = useForm<SettingsDataModelObjectEditFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(objectEditFormSchema),
  });
  const { isDirty } = formConfig.formState;

  const getUpdatePayload = (
    formValues: SettingsDataModelObjectEditFormValues,
  ) => {
    let values = formValues;
    const dirtyFieldKeys = Object.keys(
      formConfig.formState.dirtyFields,
    ) as (keyof SettingsDataModelObjectEditFormValues)[];
    const shouldComputeNamesFromLabels: boolean = dirtyFieldKeys.includes(
      IS_LABEL_SYNCED_WITH_NAME_LABEL,
    )
      ? (formValues.isLabelSyncedWithName as boolean)
      : objectMetadataItem.isLabelSyncedWithName;

    if (shouldComputeNamesFromLabels) {
      values = {
        ...values,
        ...(values.labelSingular && dirtyFieldKeys.includes('labelSingular')
          ? {
              nameSingular: computeMetadataNameFromLabel(
                formValues.labelSingular,
              ),
            }
          : {}),
        ...(values.labelPlural && dirtyFieldKeys.includes('labelPlural')
          ? {
              namePlural: computeMetadataNameFromLabel(formValues.labelPlural),
            }
          : {}),
      };
    }

    return settingsUpdateObjectInputSchema.parse(
      pick(values, [
        ...dirtyFieldKeys,
        ...(shouldComputeNamesFromLabels &&
        dirtyFieldKeys.includes('labelPlural')
          ? ['namePlural']
          : []),
        ...(shouldComputeNamesFromLabels &&
        dirtyFieldKeys.includes('labelSingular')
          ? ['nameSingular']
          : []),
      ]),
    );
  };

  const handleSave = async (
    formValues: SettingsDataModelObjectEditFormValues,
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

  const handleDisable = async () => {
    await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { isActive: false },
    });
    navigate(SettingsPath.Objects);
  };

  return (
    <RecordFieldValueSelectorContextProvider>
      <FormProvider {...formConfig}>
        <StyledContentContainer>
          <StyledFormSection>
            <H2Title
              title={t`About`}
              description={t`Name in both singular (e.g., 'Invoice') and plural (e.g., 'Invoices') forms.`}
            />
            <SettingsDataModelObjectAboutForm
              disableEdition={!objectMetadataItem.isCustom}
              objectMetadataItem={objectMetadataItem}
              onBlur={() => {
                formConfig.handleSubmit(handleSave)();
              }}
            />
          </StyledFormSection>
          <StyledFormSection>
            <Section>
              <H2Title
                title={t`Options`}
                description={t`Choose the fields that will identify your records`}
              />
              <SettingsDataModelObjectSettingsFormCard
                onBlur={() => formConfig.handleSubmit(handleSave)()}
                objectMetadataItem={objectMetadataItem}
              />
            </Section>
          </StyledFormSection>
          <StyledFormSection>
            <Section>
              <H2Title
                title={t`Danger zone`}
                description={t`Deactivate object`}
              />
              <Button
                Icon={IconArchive}
                title={t`Deactivate`}
                size="small"
                onClick={handleDisable}
              />
            </Section>
          </StyledFormSection>
        </StyledContentContainer>
      </FormProvider>
    </RecordFieldValueSelectorContextProvider>
  );
};
