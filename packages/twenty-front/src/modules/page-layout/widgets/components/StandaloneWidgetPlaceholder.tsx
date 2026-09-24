import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledPlaceholderContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${themeCssVariables.spacing[2]};
  position: relative;
  width: 100%;
`;

export const StandaloneWidgetPlaceholder = () => {
  return (
    <StyledPlaceholderContainer className="widget">
      <EmptyState.Root>
        <AnimatedPlaceholder type="noWidgets" />
        <EmptyState.Content>
          <EmptyState.Title>
            <Trans>Nothing to see</Trans>
          </EmptyState.Title>
          <EmptyState.Description>
            <Trans>This page has no content</Trans>
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    </StyledPlaceholderContainer>
  );
};
