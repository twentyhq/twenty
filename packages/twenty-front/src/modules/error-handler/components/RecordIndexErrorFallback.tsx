import { Button } from '@/ui/input/button/components/Button';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useEffect } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  IconRefresh,
} from 'twenty-ui';

type RecordIndexErrorFallbackProps = FallbackProps;

export const RecordIndexErrorFallback = ({
  error,
  resetErrorBoundary,
}: RecordIndexErrorFallbackProps) => {
  const location = useLocation();

  useEffect(() => {
    resetErrorBoundary();
  }, [location, resetErrorBoundary]);

  return (
    <PageContainer>
      <PageHeader title={'Record Index'} />
      <PageBody>
        <AnimatedPlaceholderEmptyContainer>
          <AnimatedPlaceholder type="errorIndex" />
          <AnimatedPlaceholderEmptyTextContainer>
            <AnimatedPlaceholderEmptyTitle>
              Server’s on a coffee break
            </AnimatedPlaceholderEmptyTitle>
            <AnimatedPlaceholderEmptySubTitle>
              {error.message}
            </AnimatedPlaceholderEmptySubTitle>
          </AnimatedPlaceholderEmptyTextContainer>
          <Button
            Icon={IconRefresh}
            title="Reload"
            variant={'secondary'}
            onClick={() => resetErrorBoundary()}
          />
        </AnimatedPlaceholderEmptyContainer>
      </PageBody>
    </PageContainer>
  );
};
