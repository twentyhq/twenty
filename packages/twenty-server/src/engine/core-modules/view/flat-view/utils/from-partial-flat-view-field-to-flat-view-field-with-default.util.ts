import { v4 } from 'uuid';

import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';

export const fromPartialFlatViewFieldToFlatViewFieldWithDefault = (
  partialFlatViewField: Partial<FlatViewField>,
): FlatViewField => {
  const createdAt = new Date();
  const viewFieldId = partialFlatViewField.id ?? v4();

  return {
    ...partialFlatViewField,
    id: viewFieldId,
    fieldMetadataId: partialFlatViewField.fieldMetadataId ?? '',
    isVisible: partialFlatViewField.isVisible ?? true,
    size: partialFlatViewField.size ?? 0,
    position: partialFlatViewField.position ?? 0,
    aggregateOperation: partialFlatViewField.aggregateOperation ?? null,
    viewId: partialFlatViewField.viewId ?? '',
    workspaceId: partialFlatViewField.workspaceId ?? '',
    createdAt: createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier:
      partialFlatViewField.universalIdentifier ?? viewFieldId,
  };
};
