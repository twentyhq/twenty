import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';

import { SetMainContextStoreComponentInstanceIdEffect } from '@/context-store/components/SetMainContextStoreComponentInstanceIdEffect';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { RecordIndexContainer } from '@/object-record/record-index/components/RecordIndexContainer';
import { RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect } from '@/object-record/record-index/components/RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect';
import { RecordIndexContainerContextStoreObjectMetadataEffect } from '@/object-record/record-index/components/RecordIndexContainerContextStoreObjectMetadataEffect';
import { RecordIndexPageHeader } from '@/object-record/record-index/components/RecordIndexPageHeader';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { useHandleIndexIdentifierClick } from '@/object-record/record-index/hooks/useHandleIndexIdentifierClick';
import { useCreateNewTableRecord } from '@/object-record/record-table/hooks/useCreateNewTableRecords';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
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
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: recordIndexId }}
        >
          <PageTitle title={`${capitalize(objectNamePlural)}`} />
          <RecordIndexPageHeader />
          <PageBody>
            <StyledIndexContainer>
              <ContextStoreComponentInstanceContext.Provider
                value={{
                  instanceId: 'record-index',
                }}
              >
                <RecordIndexContainerContextStoreObjectMetadataEffect />
                <RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect />
                <SetMainContextStoreComponentInstanceIdEffect />
                <RecordIndexContainer />
              </ContextStoreComponentInstanceContext.Provider>
            </StyledIndexContainer>
          </PageBody>
        </ViewComponentInstanceContext.Provider>
      </RecordIndexRootPropsContext.Provider>
    </PageContainer>
  );
};
