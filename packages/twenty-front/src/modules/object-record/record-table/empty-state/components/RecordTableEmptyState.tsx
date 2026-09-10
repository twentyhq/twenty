import { RecordIndexEmptyState } from '@/object-record/record-index/components/RecordIndexEmptyState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isSoftDeleteFilterActiveComponentState } from '@/object-record/record-table/states/isSoftDeleteFilterActiveComponentState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordTableEmptyState = () => {
  const { recordTableId, objectMetadataItem, objectPermissions } =
    useRecordTableContextOrThrow();

  const isSoftDeleteFilterActive = useAtomComponentStateValue(
    isSoftDeleteFilterActiveComponentState,
    recordTableId,
  );

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  return (
    <RecordIndexEmptyState
      objectMetadataItem={objectMetadataItem}
      objectPermissions={objectPermissions}
      isSoftDeleteFilterActive={isSoftDeleteFilterActive}
      width={scrollWrapperHTMLElement?.clientWidth}
    />
  );
};
