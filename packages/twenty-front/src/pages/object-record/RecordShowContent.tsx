import { RecordShowActionMenu } from '@/action-menu/components/RecordShowActionMenu';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { RecordShowContainer } from '@/object-record/record-show/components/RecordShowContainer';
import { RecordShowEffect } from '@/object-record/record-show/components/RecordShowEffect';
import { computeRecordShowComponentInstanceId } from '@/object-record/record-show/utils/computeRecordShowComponentInstanceId';
import { PageHeaderToggleCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderToggleCommandMenuButton';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { RecordShowPageHeader } from '~/pages/object-record/RecordShowPageHeader';
import { RecordShowPageTitle } from '~/pages/object-record/RecordShowPageTitle';

export const RecordShowContent = ({
  objectNameSingular,
  objectRecordId,
}: {
  objectNameSingular: string;
  objectRecordId: string;
}) => {
  const recordShowComponentInstanceId =
    computeRecordShowComponentInstanceId(objectRecordId);

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={recordShowComponentInstanceId}
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
    </RecordComponentInstanceContextsWrapper>
  );
};
