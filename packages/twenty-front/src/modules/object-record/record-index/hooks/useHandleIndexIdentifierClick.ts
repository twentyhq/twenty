import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { buildShowPageURL } from '@/object-record/record-show/utils/buildShowPageURL';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export const useHandleIndexIdentifierClick = ({
  objectMetadataItem,
  recordIndexId,
}: {
  recordIndexId: string;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const navigate = useNavigate();

  const currentViewId = useRecoilValue(
    currentViewIdComponentState({
      scopeId: recordIndexId,
    }),
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
