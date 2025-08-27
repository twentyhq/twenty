import { CreateRelatedRecordAction } from '@/action-menu/actions/record-actions/single-record/components/CreateRelatedRecordAction';
import { type ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isRecordReadOnly } from '@/object-record/read-only/utils/isRecordReadOnly';
import { msg } from '@lingui/core/macro';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent, IconPlus } from 'twenty-ui/display';

interface GenerateRelatedRecordActionsParams {
  sourceObjectMetadataItem?: ObjectMetadataItem;
  getIcon: (iconKey: string) => IconComponent;
  startPosition: number;
}

export const useRelatedRecordActions = ({
  sourceObjectMetadataItem,
  getIcon,
  startPosition,
}: GenerateRelatedRecordActionsParams): Record<string, ActionConfig> => {
  const relatedActions: Record<string, ActionConfig> = {};

  const { objectMetadataItems } = useObjectMetadataItems();

  if (!sourceObjectMetadataItem?.fields) {
    return relatedActions;
  }

  const oneToManyFields = sourceObjectMetadataItem.readableFields.filter(
    (field) =>
      field.type === 'RELATION' &&
      field.relation?.type === 'ONE_TO_MANY' &&
      !field.isSystem,
  );

  let currentPosition = startPosition;

  for (const field of oneToManyFields) {
    if (!isDefined(field.relation)) {
      throw new Error(`Field relation is undefined for field: ${field.id}`);
    }

    const targetObjectName = field.relation.targetObjectMetadata.nameSingular;

    const targetObjectMetadataItem = objectMetadataItems.find(
      (item) => item.nameSingular === targetObjectName,
    );

    if (!isDefined(targetObjectMetadataItem)) {
      throw new Error(
        `Target object metadata item is undefined for field: ${field.id}`,
      );
    }

    const targetObjectNameSingular = targetObjectMetadataItem.nameSingular;
    const targetObjectLabelSingular =
      targetObjectNameSingular === CoreObjectNameSingular.TaskTarget
        ? 'task'
        : targetObjectNameSingular === CoreObjectNameSingular.NoteTarget
          ? 'note'
          : targetObjectMetadataItem.labelSingular.toLowerCase();

    const actionKey = `create-related-${targetObjectLabelSingular}`;

    relatedActions[actionKey] = {
      type: ActionType.Standard,
      scope: ActionScope.CreateRelatedRecord,
      key: actionKey,
      label: msg`Create ${targetObjectLabelSingular}`,
      shortLabel: msg`Create ${targetObjectLabelSingular}`,
      position: currentPosition,
      Icon: field.icon ? getIcon(field.icon) : IconPlus,
      accent: 'default',
      isPinned: false,
      shouldBeRegistered: ({
        selectedRecord,
        objectPermissions,
        getTargetObjectWritePermission,
        objectMetadataItem,
      }) =>
        (isDefined(selectedRecord) &&
          isDefined(objectMetadataItem) &&
          isRecordReadOnly({
            objectPermissions: {
              canUpdateObjectRecords: objectPermissions.canUpdateObjectRecords,
              objectMetadataId: objectMetadataItem.id,
            },
            objectMetadataItem,
            isRecordDeleted: isDefined(selectedRecord.deletedAt),
          }) &&
          objectPermissions.canUpdateObjectRecords &&
          getTargetObjectWritePermission(
            targetObjectNameSingular === CoreObjectNameSingular.TaskTarget
              ? CoreObjectNameSingular.Task
              : targetObjectNameSingular === CoreObjectNameSingular.NoteTarget
                ? CoreObjectNameSingular.Note
                : targetObjectNameSingular,
          )) ??
        false,
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: React.createElement(CreateRelatedRecordAction, {
        targetFieldMetadataItemRelation: field.relation,
      }),
    };

    currentPosition++;
  }

  return relatedActions;
};
