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
import { FieldMetadataType } from '~/generated-metadata/graphql';

type UseFieldPreviewParams = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'type' | 'options' | 'defaultValue'
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
      nameSingular: CoreObjectNameSingular.Company,
    },
    skip:
      skip ||
      fieldMetadataItem.type !== FieldMetadataType.Relation ||
      !relationObjectMetadataItem,
  });

  if (skip === true) return null;

  switch (fieldMetadataItem.type) {
    case FieldMetadataType.Currency:
      return getCurrencyFieldPreviewValue({ fieldMetadataItem });
    case FieldMetadataType.Relation:
      return relationFieldPreviewValue;
    case FieldMetadataType.Select:
      return getSelectFieldPreviewValue({ fieldMetadataItem });
    case FieldMetadataType.MultiSelect:
      return getMultiSelectFieldPreviewValue({ fieldMetadataItem });
    case FieldMetadataType.Address:
      return getAddressFieldPreviewValue({ fieldMetadataItem });
    case FieldMetadataType.Phones:
      return getPhonesFieldPreviewValue({ fieldMetadataItem });
    default:
      return getFieldPreviewValue({ fieldMetadataItem });
  }
};
