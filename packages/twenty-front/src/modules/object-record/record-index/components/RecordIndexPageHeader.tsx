import { RecordIndexActionMenu } from '@/action-menu/components/RecordIndexActionMenu';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isObjectMetadataReadOnly } from '@/object-metadata/utils/isObjectMetadataReadOnly';
import { RecordIndexPageKanbanAddButton } from '@/object-record/record-index/components/RecordIndexPageKanbanAddButton';
import { RecordIndexPageTableAddButton } from '@/object-record/record-index/components/RecordIndexPageTableAddButton';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { PageHeaderOpenCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderOpenCommandMenuButton';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewType } from '@/views/types/ViewType';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared';
import { isDefined, useIcons } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

export const RecordIndexPageHeader = () => {
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const { objectNamePlural } = useRecordIndexContextOrThrow();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { getIcon } = useIcons();
  const Icon = getIcon(objectMetadataItem?.icon);

  const recordIndexViewType = useRecoilValue(recordIndexViewTypeState);

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const numberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const isObjectMetadataItemReadOnly =
    isDefined(objectMetadataItem) &&
    isObjectMetadataReadOnly(objectMetadataItem);

  const shouldDisplayAddButton =
    (numberOfSelectedRecords === 0 || !isCommandMenuV2Enabled) &&
    !isObjectMetadataItemReadOnly &&
    !isCommandMenuV2Enabled;

  const isTable = recordIndexViewType === ViewType.Table;

  const pageHeaderTitle =
    objectMetadataItem?.labelPlural ?? capitalize(objectNamePlural);

  return (
    <PageHeader title={pageHeaderTitle} Icon={Icon}>
      {shouldDisplayAddButton &&
        /**
         * TODO: Logic between Table and Kanban should be merged here when we move some states to record-index
         */
        (isTable ? (
          <RecordIndexPageTableAddButton />
        ) : (
          <RecordIndexPageKanbanAddButton />
        ))}

      {isCommandMenuV2Enabled && (
        <>
          <RecordIndexActionMenu indexId={recordIndexId} />
          <PageHeaderOpenCommandMenuButton />
        </>
      )}
    </PageHeader>
  );
};
