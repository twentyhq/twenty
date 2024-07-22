/* eslint-disable @nx/workspace-no-navigate-prefer-link */
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { useRecordIdsFromFindManyCacheRootQuery } from '@/object-record/record-show/hooks/useRecordIdsFromFindManyCacheRootQuery';
import { buildShowPageURL } from '@/object-record/record-show/utils/buildShowPageURL';
import { buildIndexTablePageURL } from '@/object-record/record-table/utils/buildIndexTableURL';
import { useQueryVariablesFromActiveFieldsOfViewOrDefaultView } from '@/views/hooks/useQueryVariablesFromActiveFieldsOfViewOrDefaultView';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { capitalize } from '~/utils/string/capitalize';

export const useRecordShowPagePagination = (
  propsObjectNameSingular: string,
  propsObjectRecordId: string,
) => {
  const {
    objectNameSingular: paramObjectNameSingular,
    objectRecordId: paramObjectRecordId,
  } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewIdQueryParam = searchParams.get('view');

  const setLastShowPageRecordId = useSetRecoilState(lastShowPageRecordIdState);

  const objectNameSingular = propsObjectNameSingular || paramObjectNameSingular;
  const objectRecordId = propsObjectRecordId || paramObjectRecordId;

  if (!objectNameSingular || !objectRecordId) {
    throw new Error('Object name or Record id is not defined');
  }

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const recordGqlFields = generateDepthOneRecordGqlFields({
    objectMetadataItem,
  });

  const { filter, orderBy } =
    useQueryVariablesFromActiveFieldsOfViewOrDefaultView({
      objectMetadataItem,
      viewId: viewIdQueryParam,
    });

  const { loading: loadingCursor, pageInfo: currentRecordsPageInfo } =
    useFindManyRecords({
      filter: {
        id: { eq: objectRecordId },
      },
      orderBy,
      limit: 1,
      objectNameSingular,
      recordGqlFields,
    });

  const cursorFromRequest = currentRecordsPageInfo?.endCursor;

  const {
    loading: loadingRecordBefore,
    records: recordsBefore,
    totalCount: totalCountBefore,
  } = useFindManyRecords({
    skip: loadingCursor,
    fetchPolicy: 'network-only',
    filter,
    orderBy,
    cursorFilter: isNonEmptyString(cursorFromRequest)
      ? {
          cursorDirection: 'before',
          cursor: cursorFromRequest,
          limit: 1,
        }
      : undefined,
    objectNameSingular,
    recordGqlFields,
  });

  const {
    loading: loadingRecordAfter,
    records: recordsAfter,
    totalCount: totalCountAfter,
  } = useFindManyRecords({
    skip: loadingCursor,
    filter,
    fetchPolicy: 'network-only',
    orderBy,
    cursorFilter: cursorFromRequest
      ? {
          cursorDirection: 'after',
          cursor: cursorFromRequest,
          limit: 1,
        }
      : undefined,
    objectNameSingular,
    recordGqlFields,
  });

  const [totalCount, setTotalCount] = useState(
    Math.max(totalCountBefore ?? 0, totalCountAfter ?? 0),
  );

  useEffect(() => {
    if (totalCountBefore !== undefined || totalCountAfter !== undefined) {
      setTotalCount(Math.max(totalCountBefore ?? 0, totalCountAfter ?? 0));
    }
  }, [totalCountBefore, totalCountAfter]);

  const loading = loadingRecordAfter || loadingRecordBefore || loadingCursor;

  const isThereARecordBefore = recordsBefore.length > 0;
  const isThereARecordAfter = recordsAfter.length > 0;

  const recordBefore = recordsBefore[0];
  const recordAfter = recordsAfter[0];

  const navigateToPreviousRecord = () => {
    navigate(
      buildShowPageURL(objectNameSingular, recordBefore.id, viewIdQueryParam),
    );
  };

  const navigateToNextRecord = () => {
    navigate(
      buildShowPageURL(objectNameSingular, recordAfter.id, viewIdQueryParam),
    );
  };

  const navigateToIndexView = () => {
    const indexTableURL = buildIndexTablePageURL(
      objectMetadataItem.namePlural,
      viewIdQueryParam,
    );

    setLastShowPageRecordId(objectRecordId);

    navigate(indexTableURL);
  };

  const { recordIdsInCache } = useRecordIdsFromFindManyCacheRootQuery({
    objectNamePlural: objectMetadataItem.namePlural,
    fieldVariables: {
      filter,
      orderBy,
    },
  });

  const rankInView = recordIdsInCache.findIndex((id) => id === objectRecordId);

  const rankFoundInFiew = rankInView > -1;

  const objectLabel = capitalize(objectMetadataItem.namePlural);

  const viewNameWithCount = rankFoundInFiew
    ? `${rankInView + 1} of ${totalCount} in ${objectLabel}`
    : `${objectLabel} (${totalCount})`;

  return {
    viewName: viewNameWithCount,
    hasPreviousRecord: isThereARecordBefore,
    isLoadingPagination: loading,
    hasNextRecord: isThereARecordAfter,
    navigateToPreviousRecord,
    navigateToNextRecord,
    navigateToIndexView,
  };
};
