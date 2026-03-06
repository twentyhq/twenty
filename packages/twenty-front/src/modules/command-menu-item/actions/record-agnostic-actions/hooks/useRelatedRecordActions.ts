import { CreateRelatedRecordAction } from '@/command-menu-item/actions/record-actions/single-record/components/CreateRelatedRecordAction';
import { type CommandMenuItemConfig } from '@/command-menu-item/actions/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/command-menu-item/actions/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/actions/types/CommandMenuItemType';
import { CommandMenuItemViewType, CoreObjectNameSingular } from 'twenty-shared/types';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
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
}: GenerateRelatedRecordActionsParams): Record<string, CommandMenuItemConfig> => {
  const relatedActions: Record<string, CommandMenuItemConfig> = {};

  const { objectMetadataItems } = useObjectMetadataItems();

  if (!sourceObjectMetadataItem?.fields) {
    return relatedActions;
  }

  const oneToManyFields = sourceObjectMetadataItem.readableFields.filter(
    (field) =>
      field.type === 'RELATION' &&
      field.relation?.type === 'ONE_TO_MANY' &&
      !isHiddenSystemField(field),
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
      type: CommandMenuItemType.Standard,
      scope: CommandMenuItemScope.CreateRelatedRecord,
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
        CommandMenuItemViewType.SHOW_PAGE,
        CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: React.createElement(CreateRelatedRecordAction, {
        targetFieldMetadataItemRelation: field.relation,
      }),
    };

    currentPosition++;
  }

  return relatedActions;
};
