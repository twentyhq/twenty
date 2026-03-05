import { SidePanelDashboardPageLayoutInfo } from '@/side-panel/components/SidePanelDashboardPageLayoutInfo';
import { SidePanelRecordPageLayoutInfo } from '@/side-panel/components/SidePanelRecordPageLayoutInfo';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelPageLayoutInfo = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  if (!isDefined(contextStoreCurrentObjectMetadataItemId)) {
    throw new Error('Object metadata ID is not defined');
  }

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataItemId,
  });

  const isDashboardContext =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Dashboard;

  if (isDashboardContext) {
    return <SidePanelDashboardPageLayoutInfo />;
  }

  return <SidePanelRecordPageLayoutInfo />;
};
