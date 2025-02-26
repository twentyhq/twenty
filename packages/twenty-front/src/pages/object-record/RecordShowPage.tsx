import { useParams } from 'react-router-dom';

import { RecordShowActionMenu } from '@/action-menu/components/RecordShowActionMenu';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordShowContainer } from '@/object-record/record-show/components/RecordShowContainer';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { RecordShowPageWorkflowHeader } from '@/workflow/components/RecordShowPageWorkflowHeader';
import { RecordShowPageWorkflowVersionHeader } from '@/workflow/components/RecordShowPageWorkflowVersionHeader';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';
import { RecordShowPageHeader } from '~/pages/object-record/RecordShowPageHeader';

export const RecordShowPage = () => {
  const parameters = useParams<{
    objectNameSingular: string;
    objectRecordId: string;
  }>();

  const {
    objectNameSingular,
    objectRecordId,
    headerIcon,
    loading,
    pageTitle,
    pageName,
    isFavorite,
    record,
    objectMetadataItem,
    handleFavoriteButtonClick,
  } = useRecordShowPage(
    parameters.objectNameSingular ?? '',
    parameters.objectRecordId ?? '',
  );

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  return (
    <RecordFieldValueSelectorContextProvider>
      <RecordFilterGroupsComponentInstanceContext.Provider
        value={{ instanceId: `record-show-${objectRecordId}` }}
      >
        <RecordFiltersComponentInstanceContext.Provider
          value={{ instanceId: `record-show-${objectRecordId}` }}
        >
          <RecordSortsComponentInstanceContext.Provider
            value={{ instanceId: `record-show-${objectRecordId}` }}
          >
            <ContextStoreComponentInstanceContext.Provider
              value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
            >
              <ActionMenuComponentInstanceContext.Provider
                value={{ instanceId: `record-show-${objectRecordId}` }}
              >
                <RecordValueSetterEffect recordId={objectRecordId} />
                <PageContainer>
                  <PageTitle title={pageTitle} />
                  <RecordShowPageHeader
                    objectNameSingular={objectNameSingular}
                    objectRecordId={objectRecordId}
                    headerIcon={headerIcon}
                  >
                    <>
                      {!isCommandMenuV2Enabled &&
                        objectNameSingular ===
                          CoreObjectNameSingular.Workflow && (
                          <RecordShowPageWorkflowHeader
                            workflowId={objectRecordId}
                          />
                        )}
                      {!isCommandMenuV2Enabled &&
                        objectNameSingular ===
                          CoreObjectNameSingular.WorkflowVersion && (
                          <RecordShowPageWorkflowVersionHeader
                            workflowVersionId={objectRecordId}
                          />
                        )}
                      {(isCommandMenuV2Enabled ||
                        (objectNameSingular !==
                          CoreObjectNameSingular.Workflow &&
                          objectNameSingular !==
                            CoreObjectNameSingular.WorkflowVersion)) && (
                        <RecordShowActionMenu
                          {...{
                            isFavorite,
                            record,
                            handleFavoriteButtonClick,
                            objectMetadataItem,
                            objectNameSingular,
                          }}
                        />
                      )}
                    </>
                  </RecordShowPageHeader>
                  <PageBody>
                    <TimelineActivityContext.Provider
                      value={{ labelIdentifierValue: pageName }}
                    >
                      <RecordShowContainer
                        objectNameSingular={objectNameSingular}
                        objectRecordId={objectRecordId}
                        loading={loading}
                      />
                    </TimelineActivityContext.Provider>
                  </PageBody>
                </PageContainer>
              </ActionMenuComponentInstanceContext.Provider>
            </ContextStoreComponentInstanceContext.Provider>
          </RecordSortsComponentInstanceContext.Provider>
        </RecordFiltersComponentInstanceContext.Provider>
      </RecordFilterGroupsComponentInstanceContext.Provider>
    </RecordFieldValueSelectorContextProvider>
  );
};
