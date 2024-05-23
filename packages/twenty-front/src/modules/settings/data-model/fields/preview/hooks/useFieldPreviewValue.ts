import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { usePreviewRecord } from '@/settings/data-model/fields/preview/hooks/usePreviewRecord';
import { useRelationFieldPreviewValue } from '@/settings/data-model/fields/preview/hooks/useRelationFieldPreviewValue';
import { getCurrencyFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getCurrencyFieldPreviewValue';
import { getFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getFieldPreviewValue';
import { getMultiSelectFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getMultiSelectFieldPreviewValue';
import { getSelectFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getSelectFieldPreviewValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

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
  const previewRecord = usePreviewRecord({
    objectMetadataItem,
    skip: !isLabelIdentifier,
  });

  const relationFieldPreviewValue = useRelationFieldPreviewValue({
    relationObjectMetadataItem: relationObjectMetadataItem ?? {
      fields: [],
      labelSingular: '',
      nameSingular: CoreObjectNameSingular.Company,
    },
    skip:
      fieldMetadataItem.type !== FieldMetadataType.Relation ||
      !relationObjectMetadataItem,
  });

  if (isLabelIdentifier === true && isDefined(previewRecord)) {
    const labelIdentifierFieldMetadataItem =
      getLabelIdentifierFieldMetadataItem(objectMetadataItem);

    if (isDefined(labelIdentifierFieldMetadataItem)) {
      return previewRecord[labelIdentifierFieldMetadataItem.name];
    }
  }

  switch (fieldMetadataItem.type) {
    case FieldMetadataType.Currency:
      return getCurrencyFieldPreviewValue({ fieldMetadataItem });
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
