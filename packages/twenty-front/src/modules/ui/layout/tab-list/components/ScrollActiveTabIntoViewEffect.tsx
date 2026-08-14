import { useEffect } from 'react';

type ScrollActiveTabIntoViewEffectProps = {
  tabRowRef: React.RefObject<HTMLDivElement | null>;
  activeTabId: string | null;
  isScrollable: boolean;
};

// A tab selected from the URL or from initial state can sit outside the
// scrolled region, and a rotation can push it back out, which would leave the
// row looking like nothing is selected.
export const ScrollActiveTabIntoViewEffect = ({
  tabRowRef,
  activeTabId,
  isScrollable,
}: ScrollActiveTabIntoViewEffectProps) => {
  useEffect(() => {
    const tabRow = tabRowRef.current;

    if (!isScrollable || !tabRow) {
      return;
    }

    const scrollActiveTabIntoView = () => {
      const activeTab = tabRow.querySelector('[data-active]');

      if (!(activeTab instanceof HTMLElement)) {
        return;
      }

      const activeTabLeft = activeTab.offsetLeft;
      const activeTabRight = activeTabLeft + activeTab.offsetWidth;

      if (activeTabLeft < tabRow.scrollLeft) {
        tabRow.scrollLeft = activeTabLeft;
        return;
      }

      if (activeTabRight > tabRow.scrollLeft + tabRow.clientWidth) {
        tabRow.scrollLeft = activeTabRight - tabRow.clientWidth;
      }
    };

    scrollActiveTabIntoView();

    const tabRowResizeObserver = new ResizeObserver(scrollActiveTabIntoView);
    tabRowResizeObserver.observe(tabRow);

    return () => {
      tabRowResizeObserver.disconnect();
    };
  }, [tabRowRef, activeTabId, isScrollable]);

  return <></>;
};
