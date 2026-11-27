import { isDefined } from 'twenty-shared/utils';

import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { InboxViewContextStoreEffect } from '@/inbox/components/InboxViewContextStoreEffect';
import { RecordIndexContainerGater } from '@/object-record/record-index/components/RecordIndexContainerGater';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const InboxViewList = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const isContextStoreReady =
    isDefined(contextStoreCurrentObjectMetadataItemId) &&
    isDefined(contextStoreCurrentViewId);

  return (
    <>
      <InboxViewContextStoreEffect />
      {isContextStoreReady && (
        <RecordIndexContainerGater key={contextStoreCurrentViewId} />
      )}
    </>
  );
};
