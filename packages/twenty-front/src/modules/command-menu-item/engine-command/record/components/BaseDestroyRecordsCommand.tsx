import { HeadlessConfirmationModalEngineCommandEffect } from '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useIncrementalDestroyManyRecords } from '@/object-record/hooks/useIncrementalDestroyManyRecords';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { t } from '@lingui/core/macro';
import { AppPath, type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type BaseDestroyRecordsCommandProps = {
  // When true, applies deletedAt NOT NULL filter (trash-view destroy).
  // When false, destroys live records directly without requiring prior soft-delete.
  requireSoftDeleted: boolean;
};

export const BaseDestroyRecordsCommand = ({
  requireSoftDeleted,
}: BaseDestroyRecordsCommandProps) => {
  const {
    recordIndexId,
    objectMetadataItem,
    selectedRecords,
    graphqlFilter,
    isInSidePanel,
  } = useHeadlessCommandContextApi();

  if (!isDefined(recordIndexId) || !isDefined(objectMetadataItem)) {
    throw new Error(
      'Record index ID and object metadata are required to destroy records',
    );
  }

  const isSingleRecord = selectedRecords.length === 1;

  const navigateApp = useNavigateApp();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);
  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const noMatchFilter: RecordGqlOperationFilter = { id: { in: [] } };

  const filter: RecordGqlOperationFilter = requireSoftDeleted
    ? {
        ...(graphqlFilter ?? noMatchFilter),
        deletedAt: { is: 'NOT_NULL' },
      }
    : (graphqlFilter ?? noMatchFilter);

  const { incrementalDestroyManyRecords } = useIncrementalDestroyManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter,
    pageSize: DEFAULT_QUERY_PAGE_SIZE,
    delayInMsBetweenMutations: 50,
  });

  const handleExecute = async () => {
    removeSelectedRecordsFromRecordBoard();
    resetTableRowSelection();

    if (!isDefined(graphqlFilter)) {
      throw new Error('Cannot destroy records without a valid filter');
    }

    await incrementalDestroyManyRecords();

    if (!isSingleRecord) {
      return;
    }

    if (isInSidePanel) {
      closeSidePanelMenu();
      return;
    }

    navigateApp(AppPath.RecordIndexPage, {
      objectNamePlural: objectMetadataItem.namePlural,
    });
  };

  const objectLabel = isSingleRecord
    ? objectMetadataItem.labelSingular
    : objectMetadataItem.labelPlural;

  const title = requireSoftDeleted
    ? t`Permanently Destroy ${objectLabel}`
    : t`Permanently delete ${objectLabel}`;

  const subtitle = requireSoftDeleted
    ? isSingleRecord
      ? t`Are you sure you want to destroy this ${objectMetadataItem.labelSingular}? It cannot be recovered anymore.`
      : t`Are you sure you want to destroy these ${objectMetadataItem.labelPlural}? They won't be recoverable anymore.`
    : isSingleRecord
      ? t`Are you sure you want to permanently delete this ${objectMetadataItem.labelSingular}? It cannot be recovered.`
      : t`Are you sure you want to permanently delete these ${objectMetadataItem.labelPlural}? They cannot be recovered.`;

  const confirmButtonText = requireSoftDeleted
    ? `${t`Permanently Destroy`} ${objectLabel}`
    : `${t`Permanently delete`} ${objectLabel}`;

  return (
    <HeadlessConfirmationModalEngineCommandEffect
      title={title}
      subtitle={subtitle}
      confirmButtonText={confirmButtonText}
      execute={handleExecute}
    />
  );
};
