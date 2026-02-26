import { CommandMenuDashboardPageLayoutInfo } from '@/command-menu/components/CommandMenuDashboardPageLayoutInfo';
import { CommandMenuRecordPageLayoutInfo } from '@/command-menu/components/CommandMenuRecordPageLayoutInfo';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const CommandMenuPageLayoutInfo = () => {
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
    return <CommandMenuDashboardPageLayoutInfo />;
  }

  return <CommandMenuRecordPageLayoutInfo />;
};
