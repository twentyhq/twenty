import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';
import { ManageFavoritesActionEffect } from '@/action-menu/actions/record-actions/components/ManageFavoritesActionEffect';
import { ActivateWorkflowActionEffect } from '@/action-menu/actions/record-actions/workflow-actions/components/ActivateWorkflowActionEffect';
import { SeeWorkflowExecutionsActionEffect } from '@/action-menu/actions/record-actions/workflow-actions/components/SeeWorkflowExecutionsActionEffect';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

const singleRecordActionEffects = [
  ManageFavoritesActionEffect,
  ExportRecordsActionEffect,
  DeleteRecordsActionEffect,
];

const multipleRecordActionEffects = [
  ExportRecordsActionEffect,
  DeleteRecordsActionEffect,
];

const workflowSingleRecordActionEffects = [
  ActivateWorkflowActionEffect,
  SeeWorkflowExecutionsActionEffect,
];

export const RecordActionMenuEntriesSetter = () => {
  const contextStoreNumberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataId ?? '',
  });

  if (!objectMetadataItem) {
    throw new Error(
      `Object metadata item not found for id ${contextStoreCurrentObjectMetadataId}`,
    );
  }

  if (!contextStoreNumberOfSelectedRecords) {
    return null;
  }

  const actions =
    contextStoreNumberOfSelectedRecords === 1
      ? [
          ...(objectMetadataItem.nameSingular ===
          CoreObjectNameSingular.Workflow
            ? workflowSingleRecordActionEffects
            : []),
          ...singleRecordActionEffects,
        ]
      : multipleRecordActionEffects;

  return (
    <>
      {actions.map((ActionEffect, index) => (
        <ActionEffect
          key={index}
          position={index}
          objectMetadataItem={objectMetadataItem}
        />
      ))}
    </>
  );
};
