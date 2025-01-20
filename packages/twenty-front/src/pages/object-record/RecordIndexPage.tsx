import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { MainContextStoreComponentInstanceIdSetterEffect } from '@/context-store/components/MainContextStoreComponentInstanceIdSetterEffect';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { RecordIndexContainer } from '@/object-record/record-index/components/RecordIndexContainer';
import { RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect } from '@/object-record/record-index/components/RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect';
import { RecordIndexContainerContextStoreObjectMetadataEffect } from '@/object-record/record-index/components/RecordIndexContainerContextStoreObjectMetadataEffect';
import { RecordIndexPageHeader } from '@/object-record/record-index/components/RecordIndexPageHeader';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useHandleIndexIdentifierClick } from '@/object-record/record-index/hooks/useHandleIndexIdentifierClick';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { useRecoilCallback } from 'recoil';
import { capitalize } from 'twenty-shared';
import { isDefined } from 'twenty-ui';

const StyledIndexContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export const RecordIndexPage = () => {
  const objectNamePlural = useParams().objectNamePlural ?? '';

  const contextStoreCurrentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
    objectNamePlural,
  );

  const recordIndexId = `${objectNamePlural}-${contextStoreCurrentViewId}`;

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { indexIdentifierUrl } = useHandleIndexIdentifierClick({
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

  if (!isDefined(contextStoreCurrentViewId)) {
    return;
  }

  return (
    <PageContainer>
      <RecordIndexContextProvider
        value={{
          recordIndexId,
          objectNamePlural,
          objectNameSingular,
          objectMetadataItem,
          onIndexRecordsLoaded: handleIndexRecordsLoaded,
          indexIdentifierUrl,
        }}
      >
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: recordIndexId }}
        >
          <ContextStoreComponentInstanceContext.Provider
            value={{
              instanceId: getActionMenuIdFromRecordIndexId(recordIndexId),
            }}
          >
            <ActionMenuComponentInstanceContext.Provider
              value={{
                instanceId: getActionMenuIdFromRecordIndexId(recordIndexId),
              }}
            >
              <PageTitle title={`${capitalize(objectNamePlural)}`} />
              <RecordIndexPageHeader />
              <PageBody>
                <StyledIndexContainer>
                  <RecordIndexContainerContextStoreObjectMetadataEffect />
                  <RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect />
                  <MainContextStoreComponentInstanceIdSetterEffect />
                  <RecordIndexContainer />
                </StyledIndexContainer>
              </PageBody>
            </ActionMenuComponentInstanceContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </ViewComponentInstanceContext.Provider>
      </RecordIndexContextProvider>
    </PageContainer>
  );
};
