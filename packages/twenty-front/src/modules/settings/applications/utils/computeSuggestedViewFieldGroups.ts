import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type View } from '@/views/types/View';
import { resolveViewNamePlaceholders } from '@/views/utils/resolveViewNamePlaceholders';
import { type ApplicationSuggestedViewField } from '~/generated-metadata/graphql';

export type SuggestedViewFieldGroup = {
  viewId: string;
  viewName: string;
  fields: { id: string; label: string }[];
};

export const computeSuggestedViewFieldGroups = ({
  suggestedViewFields,
  objectMetadataItems,
  viewsById,
}: {
  suggestedViewFields: Pick<
    ApplicationSuggestedViewField,
    'viewId' | 'objectMetadataId' | 'fieldMetadataId' | 'position'
  >[];
  objectMetadataItems: (Pick<
    EnrichedObjectMetadataItem,
    'id' | 'labelSingular' | 'labelPlural'
  > & { fields: Pick<FieldMetadataItem, 'id' | 'label'>[] })[];
  viewsById: Map<string, Pick<View, 'id' | 'name'>>;
}): SuggestedViewFieldGroup[] => {
  const groupsByViewId = new Map<string, SuggestedViewFieldGroup>();

  const sortedSuggestedViewFields = [...suggestedViewFields].sort(
    (suggestedViewFieldA, suggestedViewFieldB) =>
      suggestedViewFieldA.position - suggestedViewFieldB.position,
  );

  for (const suggestedViewField of sortedSuggestedViewFields) {
    const objectMetadataItem = objectMetadataItems.find(
      ({ id }) => id === suggestedViewField.objectMetadataId,
    );
    const fieldMetadataItem = objectMetadataItem?.fields.find(
      ({ id }) => id === suggestedViewField.fieldMetadataId,
    );
    const view = viewsById.get(suggestedViewField.viewId);

    if (
      !isDefined(objectMetadataItem) ||
      !isDefined(fieldMetadataItem) ||
      !isDefined(view)
    ) {
      continue;
    }

    const group = groupsByViewId.get(view.id) ?? {
      viewId: view.id,
      viewName: resolveViewNamePlaceholders(view.name, objectMetadataItem),
      fields: [],
    };

    group.fields.push({
      id: fieldMetadataItem.id,
      label: fieldMetadataItem.label,
    });
    groupsByViewId.set(view.id, group);
  }

  return [...groupsByViewId.values()];
};
