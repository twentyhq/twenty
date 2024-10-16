import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { RecordIndexContainer } from '@/object-record/record-index/components/RecordIndexContainer';
import { RecordIndexPageHeader } from '@/object-record/record-index/components/RecordIndexPageHeader';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { useHandleIndexIdentifierClick } from '@/object-record/record-index/hooks/useHandleIndexIdentifierClick';
import { useCreateNewTableRecord } from '@/object-record/record-table/hooks/useCreateNewTableRecords';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { useRecoilCallback } from 'recoil';
import { capitalize } from '~/utils/string/capitalize';

const StyledIndexContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export const RecordIndexPage = () => {
  const objectNamePlural = useParams().objectNamePlural ?? '';

  const recordIndexId = objectNamePlural ?? '';

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { createNewTableRecord } = useCreateNewTableRecord(recordIndexId);

  const handleCreateRecord = () => {
    createNewTableRecord();
  };

  const { handleIndexIdentifierClick } = useHandleIndexIdentifierClick({
    objectMetadataItem,
    recordIndexId,
  });

  const handleIndexRecordsLoaded = useRecoilCallback(
    ({ set }) =>
      () => {
        // TODO: find a better way to reset this state ?
        set(lastShowPageRecordIdState, null);
      },
    [],
  );

  return (
    <PageContainer>
      <RecordIndexRootPropsContext.Provider
        value={{
          recordIndexId,
          objectNamePlural,
          objectNameSingular,
          objectMetadataItem,
          onIndexRecordsLoaded: handleIndexRecordsLoaded,
          onIndexIdentifierClick: handleIndexIdentifierClick,
          onCreateRecord: handleCreateRecord,
        }}
      >
        <PageTitle title={`${capitalize(objectNamePlural)}`} />
        <RecordIndexPageHeader />
        <PageBody>
          <StyledIndexContainer>
            <RecordIndexContainer />
          </StyledIndexContainer>
        </PageBody>
      </RecordIndexRootPropsContext.Provider>
    </PageContainer>
  );
};
