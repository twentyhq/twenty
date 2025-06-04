import { useParams } from 'react-router-dom';

import { RecordShowActionMenu } from '@/action-menu/components/RecordShowActionMenu';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordShowContainer } from '@/object-record/record-show/components/RecordShowContainer';
import { RecordShowEffect } from '@/object-record/record-show/components/RecordShowEffect';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { computeRecordShowComponentInstanceId } from '@/object-record/record-show/utils/computeRecordShowComponentInstanceId';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { PageHeaderToggleCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderToggleCommandMenuButton';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { RecordShowPageHeader } from '~/pages/object-record/RecordShowPageHeader';
import { RecordShowPageTitle } from '~/pages/object-record/RecordShowPageTitle';

export const RecordShowPage = () => {
  const parameters = useParams<{
    objectNameSingular: string;
    objectRecordId: string;
  }>();

  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    parameters.objectNameSingular ?? '',
    parameters.objectRecordId ?? '',
  );

  const recordShowComponentInstanceId =
    computeRecordShowComponentInstanceId(objectRecordId);

  return (
    <RecordFilterGroupsComponentInstanceContext.Provider
      value={{ instanceId: recordShowComponentInstanceId }}
    >
      <RecordFiltersComponentInstanceContext.Provider
        value={{ instanceId: recordShowComponentInstanceId }}
      >
        <RecordSortsComponentInstanceContext.Provider
          value={{ instanceId: recordShowComponentInstanceId }}
        >
          <ContextStoreComponentInstanceContext.Provider
            value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
          >
            <ActionMenuComponentInstanceContext.Provider
              value={{ instanceId: recordShowComponentInstanceId }}
            >
              <PageContainer>
                <RecordShowPageTitle
                  objectNameSingular={objectNameSingular}
                  objectRecordId={objectRecordId}
                />
                <RecordShowPageHeader
                  objectNameSingular={objectNameSingular}
                  objectRecordId={objectRecordId}
                >
                  <RecordShowActionMenu />
                  <PageHeaderToggleCommandMenuButton />
                </RecordShowPageHeader>
                <PageBody>
                  <TimelineActivityContext.Provider
                    value={{
                      recordId: objectRecordId,
                    }}
                  >
                    <RecordShowEffect
                      objectNameSingular={objectNameSingular}
                      recordId={objectRecordId}
                    />
                    <RecordShowContainer
                      objectNameSingular={objectNameSingular}
                      objectRecordId={objectRecordId}
                      loading={false}
                    />
                  </TimelineActivityContext.Provider>
                </PageBody>
              </PageContainer>
            </ActionMenuComponentInstanceContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </RecordSortsComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
