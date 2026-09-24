import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';

import { type AnimatedPlaceholderType } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/types/AnimatedPlaceholderType';

type CallRecordingWidgetEmptyStateDisplayProps = {
  animatedPlaceholderType: AnimatedPlaceholderType;
  title: string;
  subTitle: string;
};

export const CallRecordingWidgetEmptyStateDisplay = ({
  animatedPlaceholderType,
  title,
  subTitle,
}: CallRecordingWidgetEmptyStateDisplayProps) => (
  <EmptyState.Root>
    <AnimatedPlaceholder type={animatedPlaceholderType} />
    <EmptyState.Content>
      <EmptyState.Title>{title}</EmptyState.Title>
      <EmptyState.Description>{subTitle}</EmptyState.Description>
    </EmptyState.Content>
  </EmptyState.Root>
);
