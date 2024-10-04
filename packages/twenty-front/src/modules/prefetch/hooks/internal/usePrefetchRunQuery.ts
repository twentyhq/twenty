import { useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PREFETCH_CONFIG } from '@/prefetch/constants/PrefetchConfig';
import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export type UsePrefetchRunQuery = {
  prefetchKey: PrefetchKey;
};

export const usePrefetchRunQuery = <T extends ObjectRecord>({
  prefetchKey,
}: UsePrefetchRunQuery) => {
  const setPrefetchDataIsLoaded = useSetRecoilState(
    prefetchIsLoadedFamilyState(prefetchKey),
  );

  const { operationSignatureFactory, objectNameSingular } =
    PREFETCH_CONFIG[prefetchKey];

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const operationSignature = operationSignatureFactory({ objectMetadataItem });

  const { upsertFindManyRecordsQueryInCache } =
    useUpsertFindManyRecordsQueryInCache({
      objectMetadataItem: objectMetadataItem,
    });

  const upsertRecordsInCache = (records: T[]) => {
    setPrefetchDataIsLoaded(false);
    upsertFindManyRecordsQueryInCache({
      queryVariables: operationSignature.variables,
      recordGqlFields: operationSignature.fields,
      objectRecordsToOverwrite: records,
      computeReferences: false,
    });
    setPrefetchDataIsLoaded(true);
  };

  return {
    objectMetadataItem,
    setPrefetchDataIsLoaded,
    upsertRecordsInCache,
  };
};
