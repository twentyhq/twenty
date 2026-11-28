import { useStore } from 'jotai';
import { useEffect } from 'react';

import { INBOX_VIEW_FALLBACK_ORDER_BY } from '@/inbox/constants/InboxViewFallbackOrderBy';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { recordIndexFallbackOrderByComponentState } from '@/object-record/record-index/states/recordIndexFallbackOrderByComponentState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

type InboxViewFallbackOrderEffectProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

// Set for every view up front, so the first query of a view is already ordered
export const InboxViewFallbackOrderEffect = ({
  objectMetadataItem,
}: InboxViewFallbackOrderEffectProps) => {
  const store = useStore();
  const views = useAtomStateValue(viewsSelector);

  useEffect(() => {
    const inboxViews = views.filter(
      (view) => view.objectMetadataId === objectMetadataItem.id,
    );

    for (const inboxView of inboxViews) {
      store.set(
        recordIndexFallbackOrderByComponentState.atomFamily({
          instanceId: getRecordIndexIdFromObjectNamePluralAndViewId(
            objectMetadataItem.namePlural,
            inboxView.id,
          ),
        }),
        INBOX_VIEW_FALLBACK_ORDER_BY,
      );
    }
  }, [objectMetadataItem.id, objectMetadataItem.namePlural, store, views]);

  return null;
};
