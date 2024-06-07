import { useNavigate } from 'react-router-dom';
import { IconPlus, IconSettings } from 'twenty-ui';

import { Button } from '@/ui/input/button/components/Button';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';

type RecordTableEmptyStateProps = {
  objectLabel: string;
  createRecord: () => void;
  isRemote: boolean;
};

export const RecordTableEmptyState = ({
  objectLabel,
  createRecord,
  isRemote,
}: RecordTableEmptyStateProps) => {
  const navigate = useNavigate();

  const [title, subTitle, Icon, onClick, buttonTitle] = isRemote
    ? [
        'No Data Available for Remote Table',
        'If this is unexpected, please verify your settings.',
        IconSettings,
        () => navigate('/settings/integrations'),
        'Go to Settings',
      ]
    : [
        `Add your first ${objectLabel}`,
        `Use our API or add your first ${objectLabel} manually`,
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
