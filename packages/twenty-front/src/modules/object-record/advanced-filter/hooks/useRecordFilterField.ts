import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { RelationType } from '~/generated-metadata/graphql';

export const useRecordFilterField = (recordFilterId: string) => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const { fieldMetadataItem } = useFieldMetadataItemById(
    recordFilter?.fieldMetadataId ?? '',
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const { getIcon } = useIcons();

  const icon = isDefined(fieldMetadataItem?.icon)
    ? getIcon(fieldMetadataItem?.icon)
    : undefined;

  // ONE_TO_MANY relation sub-field label (e.g., "Policies > Status")
  const isOneToManySubField =
    isDefined(fieldMetadataItem) &&
    fieldMetadataItem.type === FieldMetadataType.RELATION &&
    fieldMetadataItem.relation?.type === RelationType.ONE_TO_MANY &&
    isNonEmptyString(recordFilter?.subFieldName);

  const relationSubFieldLabel = (() => {
    if (!isOneToManySubField) {
      return '';
    }

    const targetObject = objectMetadataItems.find(
      (o) => o.id === fieldMetadataItem.relation?.targetObjectMetadata.id,
    );
    const targetField = targetObject?.fields.find(
      (f) => f.name === recordFilter?.subFieldName,
    );

    return targetField?.label ?? recordFilter?.subFieldName ?? '';
  })();

  // Composite sub-field label (e.g., "Address / City")
  const compositeSubFieldLabel =
    isDefined(fieldMetadataItem) &&
    isCompositeFieldType(fieldMetadataItem.type) &&
    isNonEmptyString(recordFilter?.subFieldName) &&
    isValidSubFieldName(recordFilter.subFieldName)
      ? getCompositeSubFieldLabel(
          fieldMetadataItem.type,
          recordFilter.subFieldName,
        )
      : '';

  let label: string;

  if (isNonEmptyString(relationSubFieldLabel)) {
    label = `${recordFilter?.label} > ${relationSubFieldLabel}`;
  } else if (isNonEmptyString(compositeSubFieldLabel)) {
    label = `${recordFilter?.label} / ${compositeSubFieldLabel}`;
  } else {
    label = recordFilter?.label ?? '';
  }

  return {
    label,
    icon,
  };
};
