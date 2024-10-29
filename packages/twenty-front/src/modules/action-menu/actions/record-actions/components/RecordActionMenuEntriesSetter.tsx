import { DeleteRecordsActionEffect } from '@/action-menu/actions/record-actions/components/DeleteRecordsActionEffect';
import { ExportRecordsActionEffect } from '@/action-menu/actions/record-actions/components/ExportRecordsActionEffect';
import { ManageFavoritesActionEffect } from '@/action-menu/actions/record-actions/components/ManageFavoritesActionEffect';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
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
    </>
  );
};
