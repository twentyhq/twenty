import { generateBreadcrumbLinks } from '@/error-handler/utils/generateBreadcrumb';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useEffect, useState } from 'react';
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
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type SettingsErrorFallbackProps = FallbackProps;

export const SettingsErrorFallback = ({
  error,
  resetErrorBoundary,
}: SettingsErrorFallbackProps) => {
  const location = useLocation();

  const [previousLocation] = useState(location);

  useEffect(() => {
    if (!isDeeplyEqual(previousLocation, location)) {
      resetErrorBoundary();
    }
  }, [previousLocation, location, resetErrorBoundary]);

  return (
    <SubMenuTopBarContainer links={generateBreadcrumbLinks(location.pathname)}>
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
    </SubMenuTopBarContainer>
  );
};
