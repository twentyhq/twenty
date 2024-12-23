import { isNonEmptyString } from '@sniptt/guards';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { useRecordIdsForShowPageNavigation } from '@/object-record/record-show/hooks/useRecordIdsForShowPageNavigation';
import { buildShowPageURL } from '@/object-record/record-show/utils/buildShowPageURL';
import { buildIndexTablePageURL } from '@/object-record/record-table/utils/buildIndexTableURL';
import { useQueryVariablesFromActiveFieldsOfViewOrDefaultView } from '@/views/hooks/useQueryVariablesFromActiveFieldsOfViewOrDefaultView';
import { isDefined } from 'twenty-ui';
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

  const { loading: loadingRecordBefore, records: recordsBefore } =
    useFindManyRecords({
      skip: loadingCursor,
      fetchPolicy: 'network-only',
      filter: {
        ...filter,
        id: { neq: objectRecordId },
      },
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
    });

  const { loading: loadingRecordAfter, records: recordsAfter } =
    useFindManyRecords({
      skip: loadingCursor,
      filter: {
        ...filter,
        id: { neq: objectRecordId },
      },
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
    });

  const recordBefore = recordsBefore[0];
  const recordAfter = recordsAfter[0];

  const { recordIds, loading: loadingRecordIds } =
    useRecordIdsForShowPageNavigation({
      objectNameSingular: objectMetadataItem.nameSingular,
      objectNamePlural: objectMetadataItem.namePlural,
      fieldVariables: {
        filter,
        orderBy,
      },
    });

  const loading =
    loadingRecordAfter ||
    loadingRecordBefore ||
    loadingCursor ||
    loadingRecordIds;

  const navigateToPreviousRecord = () => {
    if (isDefined(recordBefore)) {
      navigate(
        buildShowPageURL(objectNameSingular, recordBefore.id, viewIdQueryParam),
      );
    }
    if (!loadingRecordBefore && !isDefined(recordBefore)) {
      const firstRecordId = recordIds[recordIds.length - 1];
      navigate(
        buildShowPageURL(objectNameSingular, firstRecordId, viewIdQueryParam),
      );
    }
  };

  const navigateToNextRecord = () => {
    if (isDefined(recordAfter)) {
      navigate(
        buildShowPageURL(objectNameSingular, recordAfter.id, viewIdQueryParam),
      );
    }
    if (!loadingRecordAfter && !isDefined(recordAfter)) {
      const lastRecordId = recordIds[0];
      navigate(
        buildShowPageURL(objectNameSingular, lastRecordId, viewIdQueryParam),
      );
    }
  };

  const navigateToIndexView = () => {
    const indexTableURL = buildIndexTablePageURL(
      objectMetadataItem.namePlural,
      viewIdQueryParam,
    );

    setLastShowPageRecordId(objectRecordId);

    navigate(indexTableURL);
  };

  const rankInView = recordIds.findIndex((id) => id === objectRecordId);

  const rankFoundInView = rankInView > -1;

  const objectLabel = capitalize(objectMetadataItem.labelPlural);

  const totalCount = recordIds.length;

  const viewNameWithCount = rankFoundInView
    ? `${rankInView + 1} of ${totalCount} in ${objectLabel}`
    : `${objectLabel} (${totalCount})`;

  return {
    viewName: viewNameWithCount,
    isLoadingPagination: loading,
    navigateToPreviousRecord,
    navigateToNextRecord,
    navigateToIndexView,
  };
};
