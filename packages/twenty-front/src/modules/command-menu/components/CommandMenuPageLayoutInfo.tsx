import { CommandMenuDashboardPageLayoutInfo } from '@/command-menu/components/CommandMenuDashboardPageLayoutInfo';
import { CommandMenuRecordPageLayoutInfo } from '@/command-menu/components/CommandMenuRecordPageLayoutInfo';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const CommandMenuPageLayoutInfo = () => {
  const objectMetadataId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  if (!isDefined(objectMetadataId)) {
    throw new Error('Object metadata ID is not defined');
  }

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const isDashboardContext =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Dashboard;

  if (isDashboardContext) {
    return <CommandMenuDashboardPageLayoutInfo />;
  }

  return <CommandMenuRecordPageLayoutInfo />;
};
