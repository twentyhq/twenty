import { Loader } from '@/ui/feedback/loader/components/Loader';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  StyledEmptyContainer,
  StyledEmptyTextContainer,
  StyledEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';

export const EmailLoader = ({ loadingText }: { loadingText?: string }) => (
  <StyledEmptyContainer>
    <AnimatedPlaceholder type="loadingMessages" />
    <StyledEmptyTextContainer>
      <StyledEmptyTitle>{loadingText || 'Loading emails'}</StyledEmptyTitle>
      <Loader />
    </StyledEmptyTextContainer>
  </StyledEmptyContainer>
);
