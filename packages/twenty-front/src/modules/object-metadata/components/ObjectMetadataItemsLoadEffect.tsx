import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useCachedQueries } from '@/apollo/hooks/useCachedQueries';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useGenerateFindManyRecordsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsQuery';
import { preloadedViewsState } from '@/views/states/preloadedViewsState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const ObjectMetadataItemsLoadEffect = () => {
  const { objectMetadataItems: newObjectMetadataItems } =
    useFindManyObjectMetadataItems();

  const [objectMetadataItems, setObjectMetadataItems] = useRecoilState(
    objectMetadataItemsState,
  );

  const { writeQuery } = useCachedQueries();
  const generatedFindManyRecordsQuery = useGenerateFindManyRecordsQuery();
  const preloadedViews = useRecoilValue(preloadedViewsState);

  useEffect(() => {
    if (!isDeeplyEqual(objectMetadataItems, newObjectMetadataItems)) {
      setObjectMetadataItems(newObjectMetadataItems);

      const viewObjectMetadataItem = newObjectMetadataItems.find(
        (objectMetadataItem) => objectMetadataItem.namePlural === 'views',
      );

      console.log('viewObjectMetadataItem', viewObjectMetadataItem);

      if (viewObjectMetadataItem) {
        // writeQuery({
        //   query: generatedFindManyRecordsQuery({
        //     objectMetadataItem: viewObjectMetadataItem,
        //   }),
        //   data: { views: preloadedViews },
        // });
      }
    }
  }, [
    generatedFindManyRecordsQuery,
    newObjectMetadataItems,
    objectMetadataItems,
    preloadedViews,
    setObjectMetadataItems,
    writeQuery,
  ]);

  return <></>;
};
