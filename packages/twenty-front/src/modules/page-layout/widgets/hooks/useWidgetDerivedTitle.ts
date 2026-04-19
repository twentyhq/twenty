import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useResolveFieldMetadataIdFromNameOrId } from '@/page-layout/hooks/useResolveFieldMetadataIdFromNameOrId';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

// Relation-field widget headers must follow the target object's current
// labelPlural / labelSingular so renames (e.g. Company -> Org) propagate to
// the details panel (issue #19790).
export const useWidgetDerivedTitle = (widget: PageLayoutWidget): string => {
  const fallbackTitle = widget.title ?? '';

  const fieldMetadataIdOrName = isFieldWidget(widget)
    ? widget.configuration.fieldMetadataId
    : '';

  const resolvedFieldMetadataId = useResolveFieldMetadataIdFromNameOrId(
    fieldMetadataIdOrName,
  );

  const { fieldMetadataItem } = useFieldMetadataItemById(
    resolvedFieldMetadataId ?? '',
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  if (!isFieldWidget(widget) || !isDefined(fieldMetadataItem?.relation)) {
    return fallbackTitle;
  }

  const targetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id ===
      fieldMetadataItem.relation?.targetObjectMetadata.id,
  );

  if (!isDefined(targetObjectMetadataItem)) {
    return fallbackTitle;
  }

  const isToManyRelation =
    fieldMetadataItem.relation.type === RelationType.ONE_TO_MANY;

  return isToManyRelation
    ? targetObjectMetadataItem.labelPlural
    : targetObjectMetadataItem.labelSingular;
};
