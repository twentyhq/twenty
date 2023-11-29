import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useLazyLoadIcon } from '@/ui/input/hooks/useLazyLoadIcon';
import { Field } from '~/generated-metadata/graphql';
import { assertNotNull } from '~/utils/assert';

export const useFieldPreview = ({
  fieldMetadata,
  objectMetadataId,
}: {
  fieldMetadata: Partial<Pick<Field, 'icon' | 'id' | 'type'>>;
  objectMetadataId: string;
}) => {
  const { findObjectMetadataItemById } = useObjectMetadataItemForSettings();
  const objectMetadataItem = findObjectMetadataItemById(objectMetadataId);

  const { records: objects } = useFindManyRecords({
    objectNamePlural: objectMetadataItem?.namePlural,
    skip: !objectMetadataItem || !fieldMetadata.id,
  });

  const { Icon: ObjectIcon } = useLazyLoadIcon(objectMetadataItem?.icon ?? '');
  const { Icon: FieldIcon } = useLazyLoadIcon(fieldMetadata.icon ?? '');

  const [firstRecord] = objects;
  const fieldName = fieldMetadata.id
    ? objectMetadataItem?.fields.find(({ id }) => id === fieldMetadata.id)?.name
    : undefined;
  const value =
    fieldMetadata.type !== 'RELATION' && fieldName
      ? firstRecord?.[fieldName]
      : undefined;

  return {
    entityId: firstRecord?.id || `${objectMetadataId}-no-records`,
    FieldIcon,
    fieldName: fieldName || `${fieldMetadata.type}-new-field`,
    hasValue: assertNotNull(value),
    ObjectIcon,
    objectMetadataItem,
    value,
  };
};
