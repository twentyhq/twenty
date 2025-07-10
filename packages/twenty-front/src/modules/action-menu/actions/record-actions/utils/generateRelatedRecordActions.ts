import { CreateRelatedRecordAction } from '@/action-menu/actions/record-actions/single-record/components/CreateRelatedRecordAction';
import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { msg } from '@lingui/core/macro';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconComponent, IconPlus } from 'twenty-ui/display';

interface GenerateRelatedRecordActionsParams {
  sourceObjectMetadataItem: ObjectMetadataItem;
  getIcon: (iconKey: string) => IconComponent;
  position: number;
}

export const generateRelatedRecordActions = ({
  sourceObjectMetadataItem,
  getIcon,
  position,
}: GenerateRelatedRecordActionsParams): Record<string, ActionConfig> => {
  const relatedActions: Record<string, ActionConfig> = {};

  if (!sourceObjectMetadataItem?.fields) {
    return relatedActions;
  }

  // Find all one-to-many relation fields
  const oneToManyFields = sourceObjectMetadataItem.fields.filter(
    (field) =>
      field.type === 'RELATION' &&
      field.relation?.type === 'ONE_TO_MANY' &&
      !field.isSystem,
  );

  oneToManyFields.forEach((field) => {
    if (!field.relation) {
      return;
    }

    const targetObjectName = field.relation.targetObjectMetadata.nameSingular;
    const label = field.label.toLowerCase();
    const actionKey = `create-related-${label}`;

    relatedActions[actionKey] = {
      type: ActionType.Standard,
      scope: ActionScope.Create,
      key: actionKey,
      label: msg`Create related ${label}`,
      shortLabel: msg`Create ${label}`,
      position: position++,
      Icon: field.icon ? getIcon(field.icon) : IconPlus,
      accent: 'default',
      isPinned: false,
      shouldBeRegistered: ({
        selectedRecord,
        objectPermissions,
        getTargetObjectReadPermission,
      }) =>
        isDefined(selectedRecord) &&
        !selectedRecord.isRemote &&
        objectPermissions.canUpdateObjectRecords &&
        getTargetObjectReadPermission(targetObjectName) === true,
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: React.createElement(CreateRelatedRecordAction, {
        targetFieldMetadataItemRelation: field.relation,
      }),
    };
  });

  return relatedActions;
};
