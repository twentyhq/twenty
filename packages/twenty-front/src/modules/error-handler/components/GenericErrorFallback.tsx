import { FallbackProps } from 'react-error-boundary';
import { Button } from 'tsup.ui.index';

import { IconRefresh } from '@/ui/display/icon';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  StyledEmptyContainer,
  StyledEmptySubTitle,
  StyledEmptyTextContainer,
  StyledEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';

type GenericErrorFallbackProps = FallbackProps;

export const GenericErrorFallback = ({
  error,
  resetErrorBoundary,
}: GenericErrorFallbackProps) => {
  return (
    <StyledEmptyContainer>
      <AnimatedPlaceholder type="errorIndex" />
      <StyledEmptyTextContainer>
        <StyledEmptyTitle>Server’s on a coffee break</StyledEmptyTitle>
        <StyledEmptySubTitle>{error.message}</StyledEmptySubTitle>
      </StyledEmptyTextContainer>
      <Button
        Icon={IconRefresh}
        title="Reload"
        variant={'secondary'}
        onClick={() => resetErrorBoundary()}
      />
    </StyledEmptyContainer>
  );
};
