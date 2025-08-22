import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useRelationFieldPreviewValue } from '@/settings/data-model/fields/preview/hooks/useRelationFieldPreviewValue';
import { getAddressFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getAddressFieldPreviewValue';
import { getCurrencyFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getCurrencyFieldPreviewValue';
import { getFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getFieldPreviewValue';
import { getMultiSelectFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getMultiSelectFieldPreviewValue';
import { getPhonesFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getPhonesFieldPreviewValue';
import { getSelectFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getSelectFieldPreviewValue';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type UseFieldPreviewParams = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'type' | 'options' | 'defaultValue' | 'settings'
  >;
  relationObjectNameSingular?: string;
  skip?: boolean;
};

export const useFieldPreviewValue = ({
  fieldMetadataItem,
  relationObjectNameSingular,
  skip,
}: UseFieldPreviewParams) => {
  const relationFieldPreviewValue = useRelationFieldPreviewValue({
    relationObjectNameSingular:
      relationObjectNameSingular ?? CoreObjectNameSingular.Company,
    skip:
      skip ||
      (fieldMetadataItem.type !== FieldMetadataType.RELATION &&
        fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION) ||
      !isDefined(relationObjectNameSingular),
  });

  if (skip === true) return null;

  switch (fieldMetadataItem.type) {
    case FieldMetadataType.CURRENCY:
      return getCurrencyFieldPreviewValue({ fieldMetadataItem });
    case FieldMetadataType.MORPH_RELATION:
    case FieldMetadataType.RELATION:
      return fieldMetadataItem.settings?.relationType ===
        RelationType.MANY_TO_ONE
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
        fieldType: fieldMetadataItem.type,
        fieldSettings: fieldMetadataItem.settings,
        defaultValue: fieldMetadataItem.defaultValue,
      });
  }
};
