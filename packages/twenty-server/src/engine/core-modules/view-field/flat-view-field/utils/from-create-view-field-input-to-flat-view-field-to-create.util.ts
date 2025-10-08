import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type CreateViewFieldInput } from 'src/engine/core-modules/view-field/dtos/inputs/create-view-field.input';
import { FlatViewField } from 'src/engine/core-modules/view-field/flat-view-field/types/flat-view-field.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';

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
    size: createViewFieldInput.size ?? DEFAULT_VIEW_FIELD_SIZE,
    position: createViewFieldInput.position ?? 0,
    aggregateOperation: createViewFieldInput.aggregateOperation ?? null,
  };
};
