import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useDeleteOneObjectMetadataItem } from '@/object-metadata/hooks/useDeleteOneObjectMetadataItem';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { isShareableObjectMetadataItem } from '@/object-record/record-sharing/utils/isShareableObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsEnterpriseFeatureGateCard } from '@/settings/components/SettingsEnterpriseFeatureGateCard';
import { SettingsUpdateDataModelObjectAboutForm } from '@/settings/data-model/object-details/components/SettingsUpdateDataModelObjectAboutForm';
import { ObjectSharingReachPicker } from '@/settings/data-model/object-details/components/tabs/ObjectSharingReachPicker';
import { SettingsObjectValidationRulesSection } from '@/settings/data-model/object-details/components/tabs/SettingsObjectValidationRulesSection';
import { SettingsDataModelObjectSettingsFormCard } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectSettingsFormCard';
import { OrganizationAdornment } from '@/settings/enterprise/components/OrganizationAdornment';
import {
  type SettingsDataModelObjectAboutFormValues,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { SettingsTranslationsCard } from '@/settings/translations/components/SettingsTranslationsCard';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useHasValidationRulesEntitlement } from '@/validation-rules/hooks/useHasValidationRulesEntitlement';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { zodResolver } from '@hookform/resolvers/zod';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useForm } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isEmptyObject } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconArchive, IconBolt, IconSearch, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type ObjectSettingsProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isDeleting: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
};

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

const StyledLinkCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledDangerButtonsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const DELETE_OBJECT_MODAL_ID = 'delete-object-confirmation-modal';

export const ObjectSettings = ({
  objectMetadataItem,
  isDeleting,
  setIsDeleting,
}: ObjectSettingsProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigate = useNavigateSettings();
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const { deleteOneObjectMetadataItem } = useDeleteOneObjectMetadataItem();
  const { enqueueToast } = useToast();
  const { openDialog, closeDialog } = useDialog();

  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const aboutFormConfig = useForm<SettingsDataModelObjectAboutFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsDataModelObjectAboutFormSchema),
    defaultValues: {
      description: objectMetadataItem.description,
      icon: objectMetadataItem.icon ?? undefined,
      isLabelSyncedWithName: objectMetadataItem.isLabelSyncedWithName,
      labelPlural: objectMetadataItem.labelPlural,
      labelSingular: objectMetadataItem.labelSingular,
      namePlural: objectMetadataItem.namePlural,
      nameSingular: objectMetadataItem.nameSingular,
      ...(getIsMetadataItemCustom(objectMetadataItem)
        ? { color: getObjectColorWithFallback(objectMetadataItem) }
        : {}),
    },
  });
  const hasUnsavedAboutEdits = !isEmptyObject(
    aboutFormConfig.formState.dirtyFields,
  );

  const isReadOnly =
    isObjectMetadataReadOnly({ objectMetadataItem }) || isDDLLocked;

  const isRecordCreationFormEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
  );
  const hasValidationRulesEntitlement = useHasValidationRulesEntitlement();
  const isRecordLevelSharingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
  );

  const handleDisable = async () => {
    const result = await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { isActive: false },
    });

    if (result.status === 'successful') {
      navigate(SettingsPath.Objects);
    }
  };

  const handleDelete = () => {
    openDialog(DELETE_OBJECT_MODAL_ID);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const result = await deleteOneObjectMetadataItem(objectMetadataItem.id);

    if (result.status === 'successful') {
      enqueueToast({ status: 'success', children: t`Object deleted` });
      closeDialog(DELETE_OBJECT_MODAL_ID);
      navigate(SettingsPath.Objects);
      return;
    }

    setIsDeleting(false);
    closeDialog(DELETE_OBJECT_MODAL_ID);
  };

  const objectLabel = objectMetadataItem.labelPlural;

  return (
    <StyledContentContainer>
      <Section.Root>
        <Section.Header
          title={t`About`}
          description={t`Name in both singular (e.g., 'Invoice') and plural (e.g., 'Invoices') forms.`}
        />
        <SettingsUpdateDataModelObjectAboutForm
          objectMetadataItem={objectMetadataItem}
          formConfig={aboutFormConfig}
        />
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Options`}
          description={t`Choose the fields that will identify your records`}
        />
        <SettingsDataModelObjectSettingsFormCard
          objectMetadataItem={objectMetadataItem}
        />
      </Section.Root>
      {isRecordCreationFormEnabled &&
        !objectMetadataItem.isRemote &&
        !objectMetadataItem.isSystem && (
          <Section.Root>
            <Section.Header
              title={t`Validation rules`}
              description={t`Block records that break your rules, like an opportunity marked Won with no amount. Checked on every save.`}
              actions={<OrganizationAdornment />}
            />
            {hasValidationRulesEntitlement ? (
              <SettingsObjectValidationRulesSection
                objectMetadataItem={objectMetadataItem}
                isReadOnly={isReadOnly}
              />
            ) : (
              <SettingsEnterpriseFeatureGateCard
                title={t`Organization feature`}
                description={t`Upgrade to Organization to set validation rules.`}
                buttonTitle={t`Activate`}
              />
            )}
          </Section.Root>
        )}
      {isRecordLevelSharingEnabled &&
        isShareableObjectMetadataItem(objectMetadataItem) && (
          <Section.Root>
            <Section.Header
              title={t`Record sharing`}
              description={t`Who a record of ${objectLabel} can be shared with. Roles still decide what people see by default.`}
            />
            <ObjectSharingReachPicker
              objectMetadataItem={objectMetadataItem}
              isReadOnly={isReadOnly}
            />
          </Section.Root>
        )}
      <Section.Root>
        <Section.Header
          title={t`Advanced`}
          description={t`Settings most workspaces never need to change`}
        />
        <StyledLinkCardsContainer>
          <SettingsTranslationsCard
            objectNamePlural={objectMetadataItem.namePlural}
            disabled={hasUnsavedAboutEdits}
          />
          <SettingsCard
            to={getSettingsPath(SettingsPath.ObjectSearch, {
              objectNamePlural: objectMetadataItem.namePlural,
            })}
            Icon={<IconSearch size={theme.icon.size.md} />}
            title={t`Configure search`}
          />
          <SettingsCard
            to={getSettingsPath(SettingsPath.ObjectIndexes, {
              objectNamePlural: objectMetadataItem.namePlural,
            })}
            Icon={<IconBolt size={theme.icon.size.md} />}
            title={t`Manage indexes`}
          />
        </StyledLinkCardsContainer>
      </Section.Root>
      {!isReadOnly && (
        <Section.Root>
          <Section.Header
            title={t`Danger zone`}
            description={t`Deactivate object`}
          />
          <StyledDangerButtonsContainer>
            <Button
              startIcon={<IconArchive />}
              size="sm"
              onClick={handleDisable}
            >{t`Deactivate`}</Button>
            {getIsMetadataItemCustom(objectMetadataItem) && (
              <Button
                startIcon={<IconTrash />}
                size="sm"
                onClick={handleDelete}
                variant="outline"
                color="danger"
              >{t`Delete`}</Button>
            )}
          </StyledDangerButtonsContainer>
        </Section.Root>
      )}
      <ConfirmationDialog
        dialogId={DELETE_OBJECT_MODAL_ID}
        title={t`Delete ${objectLabel} object?`}
        subtitle={t`This will permanently delete the object and all its records. Type "yes" to confirm.`}
        confirmButtonText={t`Delete`}
        onConfirmClick={confirmDelete}
        onClose={() => closeDialog(DELETE_OBJECT_MODAL_ID)}
        confirmationValue="yes"
        confirmationPlaceholder="yes"
        loading={isDeleting}
      />
    </StyledContentContainer>
  );
};
