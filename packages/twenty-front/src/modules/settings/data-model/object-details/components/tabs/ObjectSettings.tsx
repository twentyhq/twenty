/* eslint-disable react/jsx-props-no-spreading */
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { Button, H2Title, IconArchive, Section } from 'twenty-ui';
import { z, ZodError } from 'zod';

import { useLastVisitedObjectMetadataItem } from '@/navigation/hooks/useLastVisitedObjectMetadataItem';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
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
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import styled from '@emotion/styled';
import isEmpty from 'lodash.isempty';
import pick from 'lodash.pick';
import { useSetRecoilState } from 'recoil';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { updatedObjectNamePluralState } from '~/pages/settings/data-model/states/updatedObjectNamePluralState';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
import { getAppPath } from '~/utils/navigation/getAppPath';

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
  const navigate = useNavigateSettings();
  const { enqueueSnackBar } = useSnackBar();
  const setUpdatedObjectNamePlural = useSetRecoilState(
    updatedObjectNamePluralState,
  );

  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const { lastVisitedObjectMetadataItemId } =
    useLastVisitedObjectMetadataItem();
  const { getLastVisitedViewIdFromObjectMetadataItemId } = useLastVisitedView();

  const formConfig = useForm<SettingsDataModelObjectEditFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(objectEditFormSchema),
  });

  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

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
    if (isEmpty(formConfig.formState.dirtyFields) === true) {
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

      if (lastVisitedObjectMetadataItemId === objectMetadataItem.id) {
        const lastVisitedView = getLastVisitedViewIdFromObjectMetadataItemId(
          objectMetadataItem.id,
        );
        setNavigationMemorizedUrl(
          getAppPath(
            AppPath.RecordIndexPage,
            { objectNamePlural: objectNamePluralForRedirection },
            { viewId: lastVisitedView },
          ),
        );
      }

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
              title="About"
              description="Name in both singular (e.g., 'Invoice') and plural (e.g., 'Invoices') forms."
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
                title="Options"
                description="Choose the fields that will identify your records"
              />
              <SettingsDataModelObjectSettingsFormCard
                objectMetadataItem={objectMetadataItem}
              />
            </Section>
          </StyledFormSection>
          <StyledFormSection>
            <Section>
              <H2Title title="Danger zone" description="Deactivate object" />
              <Button
                Icon={IconArchive}
                title="Deactivate"
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
