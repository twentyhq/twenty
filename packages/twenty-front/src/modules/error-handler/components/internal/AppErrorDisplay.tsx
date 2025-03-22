import { AppErrorDisplayProps } from '@/error-handler/types/AppErrorDisplayProps';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  Button,
  IconRefresh,
} from 'twenty-ui';

export const AppErrorDisplay = ({
  error,
  resetErrorBoundary,
  title = 'Sorry, something went wrong',
}: AppErrorDisplayProps) => {
  return (
    <AnimatedPlaceholderEmptyContainer>
      <AnimatedPlaceholder type="errorIndex" />
      <AnimatedPlaceholderEmptyTextContainer>
        <AnimatedPlaceholderEmptyTitle>{title}</AnimatedPlaceholderEmptyTitle>
        <AnimatedPlaceholderEmptySubTitle>
          {error.message}
        </AnimatedPlaceholderEmptySubTitle>
      </AnimatedPlaceholderEmptyTextContainer>
      <Button
        Icon={IconRefresh}
        title="Reload"
        variant={'secondary'}
        onClick={resetErrorBoundary}
      />
    </AnimatedPlaceholderEmptyContainer>
  );
};
