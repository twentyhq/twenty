import AnimatedPlaceholder, {
  AnimatedPlaceholderType,
} from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';

import { Button } from '@/ui/input/button/components/Button';
import { IconComponent } from 'twenty-ui';

type RecordTableEmptyStateDisplayProps = {
  animatedPlaceholderType: AnimatedPlaceholderType;
  title: string;
  subTitle: string;
  Icon: IconComponent;
  buttonTitle: string;
  onClick: () => void;
};

export const RecordTableEmptyStateDisplay = ({
  Icon,
  animatedPlaceholderType,
  buttonTitle,
  onClick,
  subTitle,
  title,
}: RecordTableEmptyStateDisplayProps) => {
  return (
    <AnimatedPlaceholderEmptyContainer>
      <AnimatedPlaceholder type={animatedPlaceholderType} />
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
