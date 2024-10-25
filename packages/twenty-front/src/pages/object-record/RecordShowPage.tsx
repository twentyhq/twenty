import { useParams } from 'react-router-dom';

import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordShowContainer } from '@/object-record/record-show/components/RecordShowContainer';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { RecordShowPageWorkflowHeader } from '@/workflow/components/RecordShowPageWorkflowHeader';
import { RecordShowPageWorkflowVersionHeader } from '@/workflow/components/RecordShowPageWorkflowVersionHeader';
import { RecordShowPageBaseHeader } from '~/pages/object-record/RecordShowPageBaseHeader';
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
    handleFavoriteButtonClick,
    record,
    objectMetadataItem,
  } = useRecordShowPage(
    parameters.objectNameSingular ?? '',
    parameters.objectRecordId ?? '',
  );

  return (
    <RecordFieldValueSelectorContextProvider>
      <RecordValueSetterEffect recordId={objectRecordId} />
      <PageContainer>
        <PageTitle title={pageTitle} />
        <RecordShowPageHeader
          objectNameSingular={objectNameSingular}
          objectRecordId={objectRecordId}
          headerIcon={headerIcon}
        >
          <>
            {objectNameSingular === CoreObjectNameSingular.Workflow ? (
              <RecordShowPageWorkflowHeader workflowId={objectRecordId} />
            ) : objectNameSingular ===
              CoreObjectNameSingular.WorkflowVersion ? (
              <RecordShowPageWorkflowVersionHeader
                workflowVersionId={objectRecordId}
              />
            ) : (
              <RecordShowPageBaseHeader
                {...{
                  isFavorite,
                  handleFavoriteButtonClick,
                  record,
                  objectMetadataItem,
                  objectNameSingular,
                }}
              />
            )}
          </>
        </RecordShowPageHeader>
        <PageBody>
          <TimelineActivityContext.Provider
            value={{
              labelIdentifierValue: pageName,
            }}
          >
            <RecordShowContainer
              objectNameSingular={objectNameSingular}
              objectRecordId={objectRecordId}
              loading={loading}
            />
          </TimelineActivityContext.Provider>
        </PageBody>
      </PageContainer>
    </RecordFieldValueSelectorContextProvider>
  );
};
