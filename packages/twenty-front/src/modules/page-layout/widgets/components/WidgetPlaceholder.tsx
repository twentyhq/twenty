import { WidgetContainer } from '@/page-layout/widgets/components/WidgetContainer';
import { WidgetHeader } from '@/page-layout/widgets/components/WidgetHeader';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';

type WidgetPlaceholderProps = {
  onClick: () => void;
};

export const WidgetPlaceholder = ({ onClick }: WidgetPlaceholderProps) => {
  return (
    <WidgetContainer onClick={onClick}>
      <WidgetHeader displayDragHandle={true} title="Add Widget" isEmpty />
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noWidgets" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            No widgets yet
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            Click to add your first widget
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    </WidgetContainer>
  );
};
