import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
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

const StyledFixedContainer = styled.div<{ isSettings?: boolean }>`
  ${({ isSettings, theme }) =>
    isSettings
      ? `
  padding-left: ${theme.spacing(5)};
`
      : ''}
`;

type NavigationDrawerContentProps = {
  legacyChildren?: ReactNode;
  isSettingsDrawer: boolean;
  fixedTopItems?: ReactNode;
  scrollableItems?: ReactNode;
  fixedBottomItems?: ReactNode;
};

export const NavigationDrawerContent = ({
  legacyChildren,
  isSettingsDrawer,
  fixedTopItems,
  scrollableItems,
  fixedBottomItems,
}: NavigationDrawerContentProps) => {
  if (legacyChildren !== undefined) {
    return (
      <StyledItemsContainer isSettings={isSettingsDrawer}>
        {legacyChildren}
      </StyledItemsContainer>
    );
  }

  return (
    <>
      {fixedTopItems && (
        <StyledFixedContainer isSettings={isSettingsDrawer}>
          <NavigationDrawerSection>{fixedTopItems}</NavigationDrawerSection>
        </StyledFixedContainer>
      )}
      {scrollableItems && (
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
              {scrollableItems}
            </StyledScrollableInnerContainer>
          </ScrollWrapper>
        </StyledItemsContainer>
      )}
      {fixedBottomItems && (
        <StyledFixedContainer isSettings={isSettingsDrawer}>
          <NavigationDrawerSection>{fixedBottomItems}</NavigationDrawerSection>
        </StyledFixedContainer>
      )}
    </>
  );
};
