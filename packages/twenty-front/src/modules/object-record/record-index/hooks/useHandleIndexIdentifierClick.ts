import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { buildShowPageURL } from '@/object-record/record-show/utils/buildShowPageURL';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { useNavigate } from 'react-router-dom';

export const useHandleIndexIdentifierClick = ({
  objectMetadataItem,
  recordIndexId,
}: {
  recordIndexId: string;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const navigate = useNavigate();

  const currentViewId = useRecoilComponentValueV2(
    currentViewIdComponentState,
    recordIndexId,
  );

  const handleIndexIdentifierClick = (recordId: string) => {
    const showPageURL = buildShowPageURL(
      objectMetadataItem.nameSingular,
      recordId,
      currentViewId,
    );

    navigate(showPageURL);
  };

  return { handleIndexIdentifierClick };
};
