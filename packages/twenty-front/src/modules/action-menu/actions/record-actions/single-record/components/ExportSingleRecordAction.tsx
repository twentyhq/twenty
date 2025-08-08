import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useExportSingleRecord } from '@/object-record/record-show/hooks/useExportSingleRecord';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { Action } from '@/action-menu/actions/components/Action';

export const ExportSingleRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const contextStoreCurrentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  if (!contextStoreCurrentViewId) {
    throw new Error('Current view ID is not defined');
  }

  const recordId = useSelectedRecordIdOrThrow();

  const filename = `${objectMetadataItem.nameSingular}.csv`;
  const { download } = useExportSingleRecord({
    filename,
    objectMetadataItem,
    recordId,
  });

  return <Action onClick={download} />;
};
