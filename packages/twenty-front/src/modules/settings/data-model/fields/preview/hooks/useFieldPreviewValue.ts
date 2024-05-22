import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useLabelIdentifierFieldPreviewValue } from '@/settings/data-model/fields/preview/hooks/useLabelIdentifierFieldPreviewValue';
import { useRelationFieldPreviewValue } from '@/settings/data-model/fields/preview/hooks/useRelationFieldPreviewValue';
import { getFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getFieldPreviewValue';
import { getMultiSelectFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getMultiSelectFieldPreviewValue';
import { getSelectFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getSelectFieldPreviewValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type UseFieldPreviewParams = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'type' | 'options' | 'defaultValue'
  >;
  isLabelIdentifier?: boolean;
  objectMetadataItem: ObjectMetadataItem;
  relationObjectMetadataItem?: ObjectMetadataItem;
};

export const useFieldPreviewValue = ({
  fieldMetadataItem,
  isLabelIdentifier = false,
  objectMetadataItem,
  relationObjectMetadataItem,
}: UseFieldPreviewParams) => {
  const labelIdentifierFieldPreviewValue = useLabelIdentifierFieldPreviewValue({
    objectMetadataItem,
    skip: !isLabelIdentifier,
  });

  const relationFieldPreviewValue = useRelationFieldPreviewValue({
    relationObjectMetadataItem: relationObjectMetadataItem ?? {
      fields: [],
      labelSingular: '',
      nameSingular: '',
    },
    skip:
      fieldMetadataItem.type !== FieldMetadataType.Relation ||
      !relationObjectMetadataItem,
  });

  if (isLabelIdentifier) return labelIdentifierFieldPreviewValue;

  switch (fieldMetadataItem.type) {
    case FieldMetadataType.Relation:
      return relationFieldPreviewValue;
    case FieldMetadataType.Select:
      return getSelectFieldPreviewValue({ fieldMetadataItem });
    case FieldMetadataType.MultiSelect:
      return getMultiSelectFieldPreviewValue({ fieldMetadataItem });
    default:
      return getFieldPreviewValue({ fieldMetadataItem });
  }
};
