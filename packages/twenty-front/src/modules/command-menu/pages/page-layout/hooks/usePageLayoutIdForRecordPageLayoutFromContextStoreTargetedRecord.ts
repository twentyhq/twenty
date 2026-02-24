import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

export const usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord =
  () => {
    const targetedRecordsRule = useRecoilComponentValueV2(
      contextStoreTargetedRecordsRuleComponentState,
    );

    const objectMetadataId = useRecoilComponentValueV2(
      contextStoreCurrentObjectMetadataItemIdComponentState,
    );

    if (!isDefined(objectMetadataId)) {
      throw new Error('Object metadata ID is not defined');
    }

    const { objectMetadataItem } = useObjectMetadataItemById({
      objectId: objectMetadataId ?? undefined,
    });

    if (
      !(
        targetedRecordsRule.mode === 'selection' &&
        targetedRecordsRule.selectedRecordIds.length === 1
      )
    ) {
      throw new Error('Only one record should be selected');
    }

    const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow({
      targetObjectNameSingular: objectMetadataItem.nameSingular,
    });

    return {
      pageLayoutId,
      objectNameSingular: objectMetadataItem.nameSingular,
    };
  };
