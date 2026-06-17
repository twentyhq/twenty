import { t } from '@lingui/core/macro';
import { AnimatedPlaceholder, AnimatedPlaceholderEmptyContainer, AnimatedPlaceholderEmptyTextContainer, AnimatedPlaceholderEmptyTitle } from 'twenty-ui/feedback';
import { Loader } from 'twenty-ui/feedback';

export const EmailLoader = ({ loadingText }: { loadingText?: string }) => (
  <AnimatedPlaceholderEmptyContainer>
    <AnimatedPlaceholder type="loadingMessages" />
    <AnimatedPlaceholderEmptyTextContainer>
      <AnimatedPlaceholderEmptyTitle>
        {loadingText || t`Loading emails`}
      </AnimatedPlaceholderEmptyTitle>
      <Loader />
    </AnimatedPlaceholderEmptyTextContainer>
  </AnimatedPlaceholderEmptyContainer>
);
