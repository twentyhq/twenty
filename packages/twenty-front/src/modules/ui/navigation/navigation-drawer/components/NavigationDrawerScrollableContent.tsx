import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

const StyledItemsContainer = styled.div<{ isSettings?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: auto;
  overflow: hidden;
  flex: 1;
`;

const StyledScrollableInnerContainer = styled.div<{ isSettings?: boolean }>`
  height: 100%;
  ${({ isSettings, theme }) =>
    isSettings
      ? `
  padding-left: ${theme.spacing(5)};
  padding-right: ${theme.spacing(8)};
`
      : ''}
`;

export const NavigationDrawerScrollableContent = ({
  children,
}: {
  children: ReactNode;
}) => {
  const isSettingsDrawer = useIsSettingsDrawer();

  return (
    <StyledItemsContainer isSettings={isSettingsDrawer}>
      <ScrollWrapper
        contextProviderName="navigationDrawer"
        componentInstanceId={`scroll-wrapper-${
          isSettingsDrawer ? 'settings-' : ''
        }navigation-drawer`}
        scrollbarVariant="no-padding"
        heightMode="fit-content"
        defaultEnableXScroll={false}
      >
        <StyledScrollableInnerContainer isSettings={isSettingsDrawer}>
          {children}
        </StyledScrollableInnerContainer>
      </ScrollWrapper>
    </StyledItemsContainer>
  );
};
