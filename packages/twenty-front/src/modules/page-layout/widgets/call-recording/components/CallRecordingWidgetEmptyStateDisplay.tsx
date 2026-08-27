import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  type AnimatedPlaceholderType,
} from 'twenty-ui/feedback';

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
  <AnimatedPlaceholderEmptyContainer>
    <AnimatedPlaceholder type={animatedPlaceholderType} />
    <AnimatedPlaceholderEmptyTextContainer>
      <AnimatedPlaceholderEmptyTitle>{title}</AnimatedPlaceholderEmptyTitle>
      <AnimatedPlaceholderEmptySubTitle>
        {subTitle}
      </AnimatedPlaceholderEmptySubTitle>
    </AnimatedPlaceholderEmptyTextContainer>
  </AnimatedPlaceholderEmptyContainer>
);
