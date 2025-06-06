import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRelationFieldPreviewValue } from '@/settings/data-model/fields/preview/hooks/useRelationFieldPreviewValue';
import { getAddressFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getAddressFieldPreviewValue';
import { getCurrencyFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getCurrencyFieldPreviewValue';
import { getFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getFieldPreviewValue';
import { getMultiSelectFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getMultiSelectFieldPreviewValue';
import { getPhonesFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getPhonesFieldPreviewValue';
import { getSelectFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getSelectFieldPreviewValue';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type UseFieldPreviewParams = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'type' | 'options' | 'defaultValue' | 'relation'
  >;
  relationObjectMetadataItem?: ObjectMetadataItem;
  skip?: boolean;
};

export const useFieldPreviewValue = ({
  fieldMetadataItem,
  relationObjectMetadataItem,
  skip,
}: UseFieldPreviewParams) => {
  const relationFieldPreviewValue = useRelationFieldPreviewValue({
    relationObjectMetadataItem: relationObjectMetadataItem ?? {
      fields: [],
      labelSingular: '',
      labelIdentifierFieldMetadataId: '20202020-1000-4629-87e5-9a1fae1cc2fd',
      nameSingular: CoreObjectNameSingular.Company,
    },
    skip:
      skip ||
      fieldMetadataItem.type !== FieldMetadataType.RELATION ||
      !relationObjectMetadataItem,
  });

  if (skip === true) return null;

  switch (fieldMetadataItem.type) {
    case FieldMetadataType.CURRENCY:
      return getCurrencyFieldPreviewValue({ fieldMetadataItem });
    case FieldMetadataType.RELATION:
      return fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE
        ? relationFieldPreviewValue
        : [relationFieldPreviewValue];
    case FieldMetadataType.SELECT:
      return getSelectFieldPreviewValue({ fieldMetadataItem });
    case FieldMetadataType.MULTI_SELECT:
      return getMultiSelectFieldPreviewValue({ fieldMetadataItem });
    case FieldMetadataType.ADDRESS:
      return getAddressFieldPreviewValue({ fieldMetadataItem });
    case FieldMetadataType.PHONES:
      return getPhonesFieldPreviewValue({ fieldMetadataItem });
    default:
      return getFieldPreviewValue({
        fieldMetadataItem,
      });
  }
};
