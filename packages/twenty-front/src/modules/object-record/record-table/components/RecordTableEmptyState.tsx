import { useNavigate } from 'react-router-dom';
import { IconPlus, IconSettings } from 'twenty-ui';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Button } from '@/ui/input/button/components/Button';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';

type RecordTableEmptyStateProps = {
  objectNameSingular: string;
  objectLabel: string;
  createRecord: () => void;
  isRemote: boolean;
};

export const RecordTableEmptyState = ({
  objectNameSingular,
  objectLabel,
  createRecord,
  isRemote,
}: RecordTableEmptyStateProps) => {
  const navigate = useNavigate();
  const { totalCount } = useFindManyRecords({ objectNameSingular, limit: 1 });
  const noExistingRecords = totalCount === 0;

  const [title, subTitle, Icon, onClick, buttonTitle] = isRemote
    ? [
        'No Data Available for Remote Table',
        'If this is unexpected, please verify your settings.',
        IconSettings,
        () => navigate('/settings/integrations'),
        'Go to Settings',
      ]
    : [
        noExistingRecords
          ? `Add your first ${objectLabel}`
          : `No ${objectLabel} found`,
        noExistingRecords
          ? `Use our API or add your first ${objectLabel} manually`
          : 'No records matching the filter criteria were found.',
        IconPlus,
        createRecord,
        `Add a ${objectLabel}`,
      ];

  return (
    <AnimatedPlaceholderEmptyContainer>
      <AnimatedPlaceholder type="noRecord" />
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
