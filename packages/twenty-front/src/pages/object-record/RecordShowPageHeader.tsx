import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getObjectMetadataIdentifierFields } from '@/object-metadata/utils/getObjectMetadataIdentifierFields';
import { ObjectRecordShowPageBreadcrumb } from '@/object-record/record-show/components/ObjectRecordShowPageBreadcrumb';
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
  const { viewName, navigateToIndexView, objectMetadataItem } =
    useRecordShowPagePagination(objectNameSingular, objectRecordId);

  const { headerIcon } = useRecordShowPage(objectNameSingular, objectRecordId);

  const { layout } = useRecordShowContainerTabs(
    false,
    objectNameSingular as CoreObjectNameSingular,
    false,
    objectMetadataItem,
  );

  const hasEditableName = layout.hideSummaryAndFields === true;

  const { labelIdentifierFieldMetadataItem } =
    getObjectMetadataIdentifierFields({ objectMetadataItem });

  return (
    <PageHeader
      title={
        hasEditableName ? (
          <ObjectRecordShowPageBreadcrumb
            objectNameSingular={objectNameSingular}
            objectRecordId={objectRecordId}
            objectLabelPlural={objectMetadataItem.labelPlural}
            labelIdentifierFieldMetadataItem={labelIdentifierFieldMetadataItem}
          />
        ) : (
          viewName
        )
      }
      hasClosePageButton
      onClosePage={navigateToIndexView}
      Icon={headerIcon}
    >
      {children}
    </PageHeader>
  );
};
