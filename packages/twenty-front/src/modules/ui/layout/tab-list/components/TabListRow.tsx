import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isString } from '@sniptt/guards';
import { type ReactNode, type Ref } from 'react';
import { Tabs } from 'twenty-ui/primitives/navigation';

import { TAB_LIST_GAP } from '../constants/TabListGap';
import { SCROLLABLE_TAB_ROW_CSS } from '../styles/ScrollableTabRowCSS';

const StyledRoot = styled(Tabs.Root)`
  display: contents;
`;

const StyledContainer = styled.div<{ isScrollable: boolean }>`
  display: flex;
  gap: ${TAB_LIST_GAP}px;
  max-width: 100%;
  overflow-x: ${({ isScrollable }) => (isScrollable ? 'auto' : 'hidden')};
  position: relative;
  ${SCROLLABLE_TAB_ROW_CSS}
`;

type TabListRowProps = {
  activeTabId: string | null;
  behaveAsLinks: boolean;
  children: ReactNode;
  isScrollable: boolean;
  onSelectTab: (tabId: string) => void;
  ref?: Ref<HTMLDivElement>;
};

export const TabListRow = ({
  activeTabId,
  behaveAsLinks,
  children,
  isScrollable,
  onSelectTab,
  ref,
}: TabListRowProps) => {
  const { t } = useLingui();

  if (behaveAsLinks) {
    return (
      <StyledContainer ref={ref} isScrollable={isScrollable}>
        {children}
      </StyledContainer>
    );
  }

  return (
    <StyledRoot
      value={activeTabId}
      onValueChange={(value) => {
        if (isString(value)) {
          onSelectTab(value);
        }
      }}
    >
      <Tabs.List
        ref={ref}
        aria-label={t`Tabs`}
        activateOnFocus={false}
        render={<StyledContainer isScrollable={isScrollable} />}
      >
        {children}
      </Tabs.List>
    </StyledRoot>
  );
};
