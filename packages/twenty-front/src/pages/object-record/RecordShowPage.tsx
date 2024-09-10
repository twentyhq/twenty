import { useParams } from 'react-router-dom';

import { TimelineActivityContext } from '@/activities/timelineActivities/contexts/TimelineActivityContext';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordShowContainer } from '@/object-record/record-show/components/RecordShowContainer';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { Button } from '@/ui/input/button/components/Button';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageFavoriteButton } from '@/ui/layout/page/PageFavoriteButton';
import { ShowPageAddButton } from '@/ui/layout/show-page/components/ShowPageAddButton';
import { ShowPageMoreButton } from '@/ui/layout/show-page/components/ShowPageMoreButton';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
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

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    parameters.objectRecordId,
  );
  const { activateWorkflowVersion } = useActivateWorkflowVersion();

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
              <Button
                title="Activate"
                onClick={() => {
                  console.log(
                    'activate',
                    workflowWithCurrentVersion?.currentVersion?.id,
                  );

                  return activateWorkflowVersion(
                    workflowWithCurrentVersion?.currentVersion?.id,
                  );
                }}
              />
            ) : null}

            <PageFavoriteButton
              isFavorite={isFavorite}
              onClick={handleFavoriteButtonClick}
            />
            <ShowPageAddButton
              key="add"
              activityTargetObject={{
                id: record?.id ?? '0',
                targetObjectNameSingular: objectMetadataItem?.nameSingular,
              }}
            />
            <ShowPageMoreButton
              key="more"
              recordId={record?.id ?? '0'}
              objectNameSingular={objectNameSingular}
            />
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
