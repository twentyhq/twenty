import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindRecordCursorFromFindManyCacheRootQuery } from '@/object-record/record-show/hooks/useFindRecordCursorFromFindManyCacheRootQuery';
import { buildShowPageURL } from '@/object-record/record-show/utils/buildShowPageURL';
import { useQueryVariablesFromActiveFieldsOfViewOrDefaultView } from '@/views/hooks/useQueryVariablesFromActiveFieldsOfViewOrDefaultView';
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

  const { filter, orderBy } =
    useQueryVariablesFromActiveFieldsOfViewOrDefaultView({
      objectMetadataItem,
      viewId: currentViewId,
    });

  const { findCursorInCache } = useFindRecordCursorFromFindManyCacheRootQuery({
    fieldVariables: {
      filter,
      orderBy,
    },
    objectNamePlural: objectMetadataItem.namePlural,
  });

  const handleIndexIdentifierClick = (recordId: string) => {
    const cursor = findCursorInCache(recordId);

    const showPageURL = buildShowPageURL(
      objectMetadataItem.nameSingular,
      recordId,
      currentViewId,
    );

    navigate(showPageURL, {
      state: {
        cursor,
      },
    });
  };

  return { handleIndexIdentifierClick };
};
