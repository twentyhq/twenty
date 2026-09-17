import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, type Ref } from 'react';
import { Tabs } from 'twenty-ui/primitives/navigation';

import { TAB_LIST_GAP } from '../constants/TabListGap';
import { SCROLLABLE_TAB_ROW_CSS } from '../styles/ScrollableTabRowCSS';

const StyledContainer = styled.div<{ isScrollable: boolean }>`
  display: flex;
  gap: ${TAB_LIST_GAP}px;
  max-width: 100%;
  overflow-x: ${({ isScrollable }) => (isScrollable ? 'auto' : 'hidden')};
  position: relative;
  ${SCROLLABLE_TAB_ROW_CSS}
`;

type TabListRowProps = {
  behaveAsLinks: boolean;
  children: ReactNode;
  isScrollable: boolean;
  ref?: Ref<HTMLDivElement>;
};

export const TabListRow = ({
  behaveAsLinks,
  children,
  isScrollable,
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
    <Tabs.List
      ref={ref}
      aria-label={t`Tabs`}
      activateOnFocus={false}
      render={<StyledContainer isScrollable={isScrollable} />}
    >
      {children}
    </Tabs.List>
  );
};
