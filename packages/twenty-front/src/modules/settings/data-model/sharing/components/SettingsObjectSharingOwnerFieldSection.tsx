import { useLingui } from '@lingui/react/macro';
import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';
import { IconCircleOff, useIcons } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/input';

import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getActiveFieldMetadataItems } from '@/object-metadata/utils/getActiveFieldMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { RelationType } from '~/generated-metadata/graphql';

type SettingsObjectSharingOwnerFieldSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isReadOnly: boolean;
};

export const SettingsObjectSharingOwnerFieldSection = ({
  objectMetadataItem,
  isReadOnly,
}: SettingsObjectSharingOwnerFieldSectionProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { updateOneObjectMetadataItem, loading } =
    useUpdateOneObjectMetadataItem();

  const emptyOption: SelectOption<string | null> = {
    Icon: IconCircleOff,
    label: t`None`,
    value: null,
  };

  const ownerFieldOptions: SelectOption<string | null>[] = [
    emptyOption,
    ...getActiveFieldMetadataItems(objectMetadataItem)
      .filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.type === FieldMetadataType.RELATION &&
          fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE &&
          fieldMetadataItem.relation.targetObjectMetadata.nameSingular ===
            CoreObjectNameSingular.WorkspaceMember,
      )
      .map((fieldMetadataItem) => ({
        Icon: getIcon(fieldMetadataItem.icon),
        label: fieldMetadataItem.label,
        value: fieldMetadataItem.id,
      })),
  ];

  const handleOwnerFieldChange = async (
    ownerFieldMetadataId: string | null,
  ) => {
    if (
      ownerFieldMetadataId === (objectMetadataItem.ownerFieldMetadataId ?? null)
    ) {
      return;
    }

    await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { ownerFieldMetadataId },
    });
  };

  return (
    <Select
      dropdownId="object-sharing-owner-field"
      label={t`Owner field`}
      description={t`The member this field points to gets full access to the record.`}
      emptyOption={emptyOption}
      options={ownerFieldOptions}
      value={objectMetadataItem.ownerFieldMetadataId ?? null}
      disabled={isReadOnly || loading}
      onChange={handleOwnerFieldChange}
    />
  );
};
