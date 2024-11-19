import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useEffect, useState } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  Button,
  IconRefresh,
} from 'twenty-ui';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type GenericErrorFallbackProps = FallbackProps & {
  title?: string;
  isInitialFetch?: boolean;
};

export const GenericErrorFallback = ({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  isInitialFetch = false,
}: GenericErrorFallbackProps) => {
  const location = useLocation();

  const [previousLocation] = useState(location);

  useEffect(() => {
    if (!isDeeplyEqual(previousLocation, location)) {
      resetErrorBoundary();
    }
  }, [previousLocation, location, resetErrorBoundary]);

  return (
    <PageContainer>
      {/* no header for initial fetch failure */}
      {!isInitialFetch && <PageHeader />}

      <PageBody>
        <AnimatedPlaceholderEmptyContainer>
          <AnimatedPlaceholder type="errorIndex" />
          <AnimatedPlaceholderEmptyTextContainer>
            <AnimatedPlaceholderEmptyTitle>
              {title}
            </AnimatedPlaceholderEmptyTitle>
            <AnimatedPlaceholderEmptySubTitle>
              {error.message}
            </AnimatedPlaceholderEmptySubTitle>
          </AnimatedPlaceholderEmptyTextContainer>
          {/* no refetch button for initial fetch failure, hard refresh is required */}
          {!isInitialFetch && (
            <Button
              Icon={IconRefresh}
              title="Reload"
              variant={'secondary'}
              onClick={() => resetErrorBoundary()}
            />
          )}
        </AnimatedPlaceholderEmptyContainer>
      </PageBody>
    </PageContainer>
  );
};
