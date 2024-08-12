/* eslint-disable @nx/workspace-no-navigate-prefer-link */
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { useRecordIdsFromFindManyCacheRootQuery } from '@/object-record/record-show/hooks/useRecordIdsFromFindManyCacheRootQuery';
import { buildShowPageURL } from '@/object-record/record-show/utils/buildShowPageURL';
import { buildIndexTablePageURL } from '@/object-record/record-table/utils/buildIndexTableURL';
import { useQueryVariablesFromActiveFieldsOfViewOrDefaultView } from '@/views/hooks/useQueryVariablesFromActiveFieldsOfViewOrDefaultView';
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
      recordGqlFields: { id: true },
    });

  const cursorFromRequest = currentRecordsPageInfo?.endCursor;

  const [totalCountBefore, setTotalCountBefore] = useState<number>(0);
  const [totalCountAfter, setTotalCountAfter] = useState<number>(0);

  const { loading: loadingRecordBefore, records: recordsBefore } =
    useFindManyRecords({
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
      recordGqlFields: { id: true },
      onCompleted: (_, pagination) => {
        setTotalCountBefore(pagination?.totalCount ?? 0);
      },
    });

  const { loading: loadingRecordAfter, records: recordsAfter } =
    useFindManyRecords({
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
      recordGqlFields: { id: true },
      onCompleted: (_, pagination) => {
        setTotalCountAfter(pagination?.totalCount ?? 0);
      },
    });

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

  const totalCount = Math.max(1, totalCountBefore, totalCountAfter);

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
