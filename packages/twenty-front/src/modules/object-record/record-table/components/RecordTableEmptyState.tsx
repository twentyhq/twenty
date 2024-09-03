import { useNavigate } from 'react-router-dom';
import { IconFilterOff, IconPlus, IconSettings } from 'twenty-ui';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { Button } from '@/ui/input/button/components/Button';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { useCombinedViewFilters } from '@/views/hooks/useCombinedViewFilters';
import { useRecoilValue } from 'recoil';

type RecordTableEmptyStateProps = {
  objectNameSingular: string;
  objectLabel: string;
  createRecord: () => void;
  isRemote: boolean;
  isSoftDeleteActive: boolean;
  recordTableId: string;
};

export const RecordTableEmptyState = ({
  objectNameSingular,
  objectLabel,
  createRecord,
  isRemote,
  isSoftDeleteActive,
  recordTableId,
}: RecordTableEmptyStateProps) => {
  const navigate = useNavigate();
  const { totalCount } = useFindManyRecords({ objectNameSingular, limit: 1 });
  const noExistingRecords = totalCount === 0;

  const { removeCombinedViewFilter } = useCombinedViewFilters(recordTableId);
  const { tableFiltersState } = useRecordTableStates(recordTableId);

  const tableFilters = useRecoilValue(tableFiltersState);

  const [, toggleSoftDeleteFilterState] = useHandleToggleTrashColumnFilter({
    objectNameSingular,
    viewBarId: recordTableId,
  });

  const handleRemoveSoftDeleteFilter = async () => {
    removeCombinedViewFilter(
      tableFilters.find(
        (filter) =>
          filter.definition.label === 'Deleted at' &&
          filter.operand === 'isNotEmpty',
      )?.id ?? '',
    );
    toggleSoftDeleteFilterState(false);
  };

  const [title, subTitle, Icon, onClick, buttonTitle] = isRemote
    ? [
        'No Data Available for Remote Table',
        'If this is unexpected, please verify your settings.',
        IconSettings,
        () => navigate('/settings/integrations'),
        'Go to Settings',
      ]
    : [
        isSoftDeleteActive
          ? `No Deleted ${objectLabel} found`
          : noExistingRecords
            ? `Add your first ${objectLabel}`
            : `No ${objectLabel} found`,
        isSoftDeleteActive
          ? `No deleted records matching the filter criteria were found.`
          : noExistingRecords
            ? `Use our API or add your first ${objectLabel} manually`
            : 'No records matching the filter criteria were found.',
        isSoftDeleteActive ? IconFilterOff : IconPlus,
        isSoftDeleteActive ? handleRemoveSoftDeleteFilter : createRecord,
        isSoftDeleteActive ? 'Remove Deleted filter' : `Add a ${objectLabel}`,
      ];

  return (
    <AnimatedPlaceholderEmptyContainer>
      <AnimatedPlaceholder
        type={isSoftDeleteActive ? 'noDeletedRecord' : 'noRecord'}
      />
      <AnimatedPlaceholderEmptyTextContainer>
        <AnimatedPlaceholderEmptyTitle>{title}</AnimatedPlaceholderEmptyTitle>
        <AnimatedPlaceholderEmptySubTitle>
          {subTitle}
        </AnimatedPlaceholderEmptySubTitle>
      </AnimatedPlaceholderEmptyTextContainer>
      <Button
        Icon={Icon}
        title={buttonTitle}
        variant={'secondary'}
        onClick={onClick}
      />
    </AnimatedPlaceholderEmptyContainer>
  );
};
