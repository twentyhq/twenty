import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useResolveFieldMetadataIdFromNameOrId } from '@/page-layout/hooks/useResolveFieldMetadataIdFromNameOrId';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

// Relation-field widget headers must follow the target object's current
// labelPlural / labelSingular so renames (e.g. Company -> Org) and locale
// switches propagate to the details panel (issue #19790).
export const useWidgetDerivedTitle = (widget: PageLayoutWidget): string => {
  const fieldMetadataIdOrName = isFieldWidget(widget)
    ? widget.configuration.fieldMetadataId
    : '';

  const resolvedFieldMetadataId = useResolveFieldMetadataIdFromNameOrId(
    fieldMetadataIdOrName,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const fieldMetadataItem = useMemo(() => {
    if (!isDefined(resolvedFieldMetadataId)) {
      return undefined;
    }

    for (const objectMetadataItem of objectMetadataItems) {
      const field = objectMetadataItem.fields.find(
        ({ id }) => id === resolvedFieldMetadataId,
      );

      if (isDefined(field)) {
        return field;
      }
    }

    return undefined;
  }, [objectMetadataItems, resolvedFieldMetadataId]);

  if (!isDefined(fieldMetadataItem?.relation)) {
    return widget.title;
  }

  const targetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id ===
      fieldMetadataItem.relation?.targetObjectMetadata.id,
  );

  if (!isDefined(targetObjectMetadataItem)) {
    return widget.title;
  }

  const isToManyRelation =
    fieldMetadataItem.relation.type === RelationType.ONE_TO_MANY;

  return isToManyRelation
    ? targetObjectMetadataItem.labelPlural
    : targetObjectMetadataItem.labelSingular;
};
