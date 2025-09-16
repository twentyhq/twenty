import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';

import { type CreateViewInput } from 'src/engine/core-modules/view/dtos/inputs/create-view.input';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';
import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import { v4 } from 'uuid';

export const fromCreateViewInputToFlatViewToCreate = ({
  createViewInput: rawCreateViewInput,
  workspaceId,
}: {
  createViewInput: CreateViewInput;
  workspaceId: string;
}): FlatView => {
  const { objectMetadataId, ...createViewInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewInput,
      ['id', 'name', 'objectMetadataId'],
    );

  const createdAt = new Date();

  return {
    id: createViewInput.id ?? v4(),
    objectMetadataId,
    workspaceId,
    name: createViewInput.name,
    createdAt: createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    isCustom: true,
    anyFieldFilterValue: createViewInput.anyFieldFilterValue ?? null,
    calendarFieldMetadataId: createViewInput.calendarFieldMetadataId ?? null,
    calendarLayout: createViewInput.calendarLayout ?? null,
    icon: createViewInput.icon,
    isCompact: createViewInput.isCompact ?? false,
    kanbanAggregateOperation: createViewInput.kanbanAggregateOperation ?? null,
    kanbanAggregateOperationFieldMetadataId:
      createViewInput.kanbanAggregateOperationFieldMetadataId ?? null,
    key: createViewInput.key ?? null,
    openRecordIn: createViewInput.openRecordIn ?? ViewOpenRecordIn.SIDE_PANEL,
    position: createViewInput.position ?? 0,
    type: createViewInput.type ?? ViewType.TABLE,
    universalIdentifier: v4(),
    viewFieldIds: [],
  };
};
