import { getObjectMetadataIdentifierFields } from '@/object-metadata/utils/getObjectMetadataIdentifierFields';
import { ObjectRecordShowPageBreadcrumb } from '@/object-record/record-show/components/ObjectRecordShowPageBreadcrumb';
import { RecordIdentifierBarTitle } from '@/object-record/record-show/components/RecordIdentifierBarTitle';
import { RecordShowPageHeaderRecordTitle } from '@/object-record/record-show/components/RecordShowPageHeaderRecordTitle';
import { type RecordShowPageHeaderTitleMode } from '@/object-record/record-show/types/RecordShowPageHeaderTitleMode';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';

type RecordShowPageHeaderProps = {
  objectNameSingular: string;
  objectRecordId: string;
  titleMode?: RecordShowPageHeaderTitleMode;
  children?: React.ReactNode;
};

type RecordShowPageMainHeaderProps = RecordShowPageHeaderProps;
type RecordShowPagePanelHeaderProps = Omit<
  RecordShowPageHeaderProps,
  'children' | 'titleMode'
>;

const RecordShowPageMainHeader = ({
  objectNameSingular,
  objectRecordId,
  titleMode = 'breadcrumb',
  children,
}: RecordShowPageMainHeaderProps) => {
  const { objectMetadataItem } = useRecordShowPagePagination(
    objectNameSingular,
    objectRecordId,
  );

  const { labelIdentifierFieldMetadataItem } =
    getObjectMetadataIdentifierFields({ objectMetadataItem });

  if (titleMode === 'record-title') {
    return (
      <PageCardHeader
        title={
          <RecordShowPageHeaderRecordTitle
            objectNameSingular={objectNameSingular}
            objectRecordId={objectRecordId}
          />
        }
        actionButton={children}
      />
    );
  }

  return (
    <PageCardHeader
      breadcrumb={
        <ObjectRecordShowPageBreadcrumb
          objectNameSingular={objectNameSingular}
          objectRecordId={objectRecordId}
          objectLabel={objectMetadataItem.labelPlural}
          labelIdentifierFieldMetadataItem={labelIdentifierFieldMetadataItem}
        />
      }
      actionButton={children}
    />
  );
};

const RecordShowPagePanelHeader = ({
  objectNameSingular,
  objectRecordId,
}: RecordShowPagePanelHeaderProps) => (
  <PageCardHeader
    title={
      <RecordIdentifierBarTitle
        objectNameSingular={objectNameSingular}
        objectRecordId={objectRecordId}
        variant="side-panel"
        recordLinkSurface="main"
      />
    }
  />
);

export const RecordShowPageHeader = ({
  objectNameSingular,
  objectRecordId,
  titleMode,
  children,
}: RecordShowPageHeaderProps) => {
  const workspaceSurface = useWorkspaceSurface();

  return workspaceSurface.type === 'side-panel' ? (
    <RecordShowPagePanelHeader
      objectNameSingular={objectNameSingular}
      objectRecordId={objectRecordId}
    />
  ) : (
    <RecordShowPageMainHeader
      objectNameSingular={objectNameSingular}
      objectRecordId={objectRecordId}
      titleMode={titleMode}
    >
      {children}
    </RecordShowPageMainHeader>
  );
};
