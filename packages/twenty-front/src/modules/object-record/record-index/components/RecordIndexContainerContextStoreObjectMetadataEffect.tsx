import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { useContext, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

export const RecordIndexContainerContextStoreObjectMetadataEffect = () => {
  const setContextStoreCurrentObjectMetadataItem = useSetRecoilState(
    contextStoreCurrentObjectMetadataIdState,
  );
  const { objectNamePlural } = useContext(RecordIndexRootPropsContext);

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  useEffect(() => {
    setContextStoreCurrentObjectMetadataItem(objectMetadataItem.id);

    return () => {
      setContextStoreCurrentObjectMetadataItem(null);
    };
  }, [objectMetadataItem.id, setContextStoreCurrentObjectMetadataItem]);

  return null;
};
