import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordEditableName } from '@/object-record/components/RecordEditableName';
import { useRecordShowContainerTabs } from '@/object-record/record-show/hooks/useRecordShowContainerTabs';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

export const RecordShowPageHeader = ({
  objectNameSingular,
  objectRecordId,
  children,
}: {
  objectNameSingular: string;
  objectRecordId: string;
  headerIcon: React.ComponentType;
  children?: React.ReactNode;
}) => {
  const {
    viewName,
    navigateToPreviousRecord,
    navigateToNextRecord,
    navigateToIndexView,
    objectMetadataItem,
  } = useRecordShowPagePagination(objectNameSingular, objectRecordId);

  const { headerIcon } = useRecordShowPage(objectNameSingular, objectRecordId);

  const { layout } = useRecordShowContainerTabs(
    false,
    objectNameSingular as CoreObjectNameSingular,
    false,
    objectMetadataItem,
  );

  const hasEditableName = layout.hideSummaryAndFields === true;

  return (
    <PageHeader
      title={
        hasEditableName ? (
          <RecordEditableName
            objectNameSingular={objectNameSingular}
            objectRecordId={objectRecordId}
            objectLabelPlural={objectMetadataItem.labelPlural}
          />
        ) : (
          viewName
        )
      }
      hasPaginationButtons
      hasClosePageButton
      onClosePage={navigateToIndexView}
      navigateToPreviousRecord={navigateToPreviousRecord}
      navigateToNextRecord={navigateToNextRecord}
      Icon={headerIcon}
    >
      {children}
    </PageHeader>
  );
};
