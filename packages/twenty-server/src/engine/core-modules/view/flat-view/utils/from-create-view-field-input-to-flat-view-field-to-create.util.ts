import { v4 } from 'uuid';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';

import { type CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';
import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';

export const fromCreateViewFieldInputToFlatViewFieldToCreate = ({
  createViewFieldInput: rawCreateViewFieldInput,
  workspaceId,
}: {
  createViewFieldInput: CreateViewFieldInput;
  workspaceId: string;
}): FlatViewField => {
  const { fieldMetadataId, viewId, ...createViewFieldInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewFieldInput,
      ['aggregateOperation', 'fieldMetadataId', 'id', 'viewId'],
    );

  const createdAt = new Date();
  const viewFieldId = createViewFieldInput.id ?? v4();

  return {
    id: viewFieldId,
    fieldMetadataId,
    viewId,
    workspaceId,
    createdAt: createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: viewFieldId,
    isVisible: createViewFieldInput.isVisible ?? true,
    size: createViewFieldInput.size ?? 0,
    position: createViewFieldInput.position ?? 0,
    aggregateOperation: createViewFieldInput.aggregateOperation ?? null,
  };
};
