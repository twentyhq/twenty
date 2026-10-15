import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldType } from '@/settings/data-model/types/FieldType';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { getFieldIdentifierType } from '@/settings/data-model/utils/getFieldIdentifierType';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { type SettingsObjectDetailTableItem } from '@/settings/data-model/types/SettingsObjectDetailTableItem';
import { getSettingsObjectFieldType } from '@/settings/data-model/utils/getSettingsObjectFieldType';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useMapFieldMetadataItemToSettingsObjectDetailTableItem = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) => {
  const { i18n } = useLingui();
  const getRelationMetadata = useGetRelationMetadata();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const workspaceCustomApplicationId =
    currentWorkspace?.workspaceCustomApplication?.id;

  const mapFieldMetadataItemToSettingsObjectDetailTableItem = (
    fieldMetadataItem: FieldMetadataItem,
  ): SettingsObjectDetailTableItem => {
    const fieldType = getSettingsObjectFieldType(
      objectMetadataItem,
      fieldMetadataItem,
      workspaceCustomApplicationId,
    );

    const { relationObjectMetadataItem } =
      getRelationMetadata({
        fieldMetadataItem,
      }) ?? {};

    const identifierType = getFieldIdentifierType(
      fieldMetadataItem,
      objectMetadataItem,
    );

    const fieldMetadataType = fieldMetadataItem.type as FieldType;

    const fieldTypeConfig = getSettingsFieldTypeConfig(
      fieldMetadataType as SettingsFieldType,
    );
    const translatedFieldTypeLabel = isDefined(fieldTypeConfig)
      ? i18n._(fieldTypeConfig.label)
      : '';

    return {
      fieldMetadataItem,
      fieldType: fieldType ?? '',
      dataType:
        isDefined(relationObjectMetadataItem?.labelPlural) ||
        isFieldTypeSupportedInSettings(fieldMetadataType)
          ? translatedFieldTypeLabel
          : '',
      label: fieldMetadataItem.label,
      identifierType: identifierType,
      objectMetadataItem,
    } satisfies SettingsObjectDetailTableItem;
  };

  return { mapFieldMetadataItemToSettingsObjectDetailTableItem };
};
