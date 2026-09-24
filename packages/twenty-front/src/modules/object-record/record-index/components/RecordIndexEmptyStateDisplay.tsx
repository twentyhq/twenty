import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { type AnimatedPlaceholderType } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/types/AnimatedPlaceholderType';
import { type IconComponent } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

const StyledEmptyStateContainer = styled.div`
  height: 100%;
  width: 100%;
`;

type RecordIndexEmptyStateDisplayProps = {
  animatedPlaceholderType: AnimatedPlaceholderType;
  title: string;
  subTitle: string;
  ButtonIcon?: IconComponent;
  buttonTitle?: string;
  onButtonClick?: () => void;
  width?: number;
};

export const RecordIndexEmptyStateDisplay = ({
  animatedPlaceholderType,
  title,
  subTitle,
  ButtonIcon,
  buttonTitle,
  onButtonClick,
  width,
}: RecordIndexEmptyStateDisplayProps) => (
  <StyledEmptyStateContainer>
    <EmptyState.Root width={width}>
      <AnimatedPlaceholder type={animatedPlaceholderType} />
      <EmptyState.Content>
        <EmptyState.Title>{title}</EmptyState.Title>
        <EmptyState.Description>{subTitle}</EmptyState.Description>
      </EmptyState.Content>
      {isDefined(onButtonClick) && (
        <Button
          startIcon={isDefined(ButtonIcon) ? <ButtonIcon /> : undefined}
          onClick={onButtonClick}
          variant="outline"
        >
          {buttonTitle}
        </Button>
      )}
    </EmptyState.Root>
  </StyledEmptyStateContainer>
);
