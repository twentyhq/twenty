import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const useHandleIndexIdentifierClick = ({
  objectMetadataItem,
  recordIndexId,
}: {
  recordIndexId: string;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
    recordIndexId,
  );

  const indexIdentifierUrl = (recordId: string) => {
    return getAppPath(
      AppPath.RecordShowPage,
      {
        objectNameSingular: objectMetadataItem.nameSingular,
        objectRecordId: recordId,
      },
      {
        viewId: currentViewId,
      },
    );
  };

  return { indexIdentifierUrl };
};
