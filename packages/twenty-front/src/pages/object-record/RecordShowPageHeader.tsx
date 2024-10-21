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
    hasPreviousRecord,
    hasNextRecord,
    navigateToPreviousRecord,
    navigateToNextRecord,
    navigateToIndexView,
  } = useRecordShowPagePagination(objectNameSingular, objectRecordId);

  const { headerIcon } = useRecordShowPage(objectNameSingular, objectRecordId);

  return (
    <PageHeader
      title={viewName}
      hasPaginationButtons
      hasClosePageButton
      onClosePage={navigateToIndexView}
      hasPreviousRecord={hasPreviousRecord}
      navigateToPreviousRecord={navigateToPreviousRecord}
      hasNextRecord={hasNextRecord}
      navigateToNextRecord={navigateToNextRecord}
      Icon={headerIcon}
    >
      {children}
    </PageHeader>
  );
};
