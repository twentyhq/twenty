import { type AppErrorDisplayProps } from '@/error-handler/types/AppErrorDisplayProps';
import { t } from '@lingui/core/macro';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/feedback';

export const AppErrorDisplay = ({
  resetErrorBoundary,
  title = t`Sorry, something went wrong`,
}: AppErrorDisplayProps) => {
  return (
    <AnimatedPlaceholderEmptyContainer>
      <AnimatedPlaceholder type="errorIndex" />
      <AnimatedPlaceholderEmptyTextContainer>
        <AnimatedPlaceholderEmptyTitle>{title}</AnimatedPlaceholderEmptyTitle>
        <AnimatedPlaceholderEmptySubTitle>
          {t`Please refresh the page.`}
        </AnimatedPlaceholderEmptySubTitle>
      </AnimatedPlaceholderEmptyTextContainer>
      <Button
        Icon={IconRefresh}
        title={t`Reload`}
        variant="secondary"
        onClick={resetErrorBoundary}
      />
    </AnimatedPlaceholderEmptyContainer>
  );
};
