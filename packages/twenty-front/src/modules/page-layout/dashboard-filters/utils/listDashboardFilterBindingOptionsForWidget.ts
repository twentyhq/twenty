import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { type DashboardFilterBindingOption } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingOption';
import { getDashboardFilterBindingLabel } from '@/page-layout/dashboard-filters/utils/getDashboardFilterBindingLabel';
import {
  getDashboardFilterSlotFilterTypeForField,
  isDashboardFilterCandidateField,
} from '@/page-layout/dashboard-filters/utils/isDashboardFilterCandidateField';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type BindingOptionObjectMetadataItem = Pick<
  EnrichedObjectMetadataItem,
  'id' | 'fields'
>;

const byLabel = (
  optionA: DashboardFilterBindingOption,
  optionB: DashboardFilterBindingOption,
) => optionA.label.localeCompare(optionB.label);

const listCandidateFieldsOfFilterType = ({
  fields,
  filterType,
}: {
  fields: FieldMetadataItem[];
  filterType: DashboardFilterSlot['filterType'];
}) =>
  fields.filter(
    (field) =>
      isDashboardFilterCandidateField(field) &&
      getDashboardFilterSlotFilterTypeForField(field) === filterType,
  );

// The chip's record picker is the only filter input that resolves a relation target, so one-hop bindings are offered for relation slots alone.
export const listDashboardFilterBindingOptionsForWidget = ({
  slot,
  objectMetadataItem,
  objectMetadataItems,
}: {
  slot: Pick<DashboardFilterSlot, 'filterType'>;
  objectMetadataItem: BindingOptionObjectMetadataItem;
  objectMetadataItems: BindingOptionObjectMetadataItem[];
}): DashboardFilterBindingOption[] => {
  const toOption = (
    binding: DashboardFilterBindingOption['binding'],
  ): DashboardFilterBindingOption | null => {
    const label = getDashboardFilterBindingLabel({
      binding,
      objectMetadataItems,
    });

    return isDefined(label)
      ? {
          id: [binding.fieldMetadataId, binding.relationTargetFieldMetadataId]
            .filter(isDefined)
            .join(':'),
          label,
          binding,
        }
      : null;
  };

  const directOptions = listCandidateFieldsOfFilterType({
    fields: objectMetadataItem.fields,
    filterType: slot.filterType,
  })
    .map((field) => toOption({ fieldMetadataId: field.id }))
    .filter(isDefined)
    .toSorted(byLabel);

  if (slot.filterType !== 'RELATION') {
    return directOptions;
  }

  const oneHopOptions = objectMetadataItem.fields
    .filter(isDashboardFilterCandidateField)
    .filter(isManyToOneRelationField)
    .flatMap((relationField) => {
      const targetObjectMetadataItem = objectMetadataItems.find(
        (candidateObjectMetadataItem) =>
          candidateObjectMetadataItem.id ===
          relationField.relation.targetObjectMetadata.id,
      );

      return listCandidateFieldsOfFilterType({
        fields: targetObjectMetadataItem?.fields ?? [],
        filterType: 'RELATION',
      }).map((targetField) =>
        toOption({
          fieldMetadataId: relationField.id,
          relationTargetFieldMetadataId: targetField.id,
        }),
      );
    })
    .filter(isDefined)
    .toSorted(byLabel);

  return [...directOptions, ...oneHopOptions];
};
