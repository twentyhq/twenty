import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';
import { ManageFavoritesActionEffect } from '@/action-menu/actions/record-actions/components/ManageFavoritesActionEffect';
import { WorkflowRunRecordActionEffect } from '@/action-menu/actions/record-actions/workflow-run-record-actions/components/WorkflowRunRecordActionEffect';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-ui';

const noSelectionRecordActionEffects = [ExportRecordsActionEffect];

const singleRecordActionEffects = [
  ManageFavoritesActionEffect,
  DeleteRecordsActionEffect,
];

const multipleRecordActionEffects = [
  ExportRecordsActionEffect,
  DeleteRecordsActionEffect,
];

export const RecordActionMenuEntriesSetter = () => {
  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  if (!isDefined(contextStoreCurrentObjectMetadataId)) {
    return null;
  }

  return (
    <ActionEffects objectMetadataItemId={contextStoreCurrentObjectMetadataId} />
  );
};

const ActionEffects = ({
  objectMetadataItemId,
}: {
  objectMetadataItemId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const contextStoreNumberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const isWorkflowEnabled = useIsFeatureEnabled('IS_WORKFLOW_ENABLED');

  const actions =
    contextStoreNumberOfSelectedRecords === 0
      ? noSelectionRecordActionEffects
      : contextStoreNumberOfSelectedRecords === 1
        ? singleRecordActionEffects
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
      {contextStoreNumberOfSelectedRecords === 1 && isWorkflowEnabled && (
        <WorkflowRunRecordActionEffect
          objectMetadataItem={objectMetadataItem}
        />
      )}
    </>
  );
};
