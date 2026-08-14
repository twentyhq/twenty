import { useEffect, useRef } from 'react';

type UseScrollActiveTabIntoViewParams = {
  activeTabId: string | null;
  isScrollable: boolean;
};

// A tab selected from the URL or from initial state can sit outside the
// scrolled region, which would leave the row looking like nothing is selected.
export const useScrollActiveTabIntoView = ({
  activeTabId,
  isScrollable,
}: UseScrollActiveTabIntoViewParams) => {
  const tabRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isScrollable) {
      return;
    }

    const tabRow = tabRowRef.current;
    const activeTab = tabRow?.querySelector('[data-active]');

    if (!tabRow || !(activeTab instanceof HTMLElement)) {
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
  }, [activeTabId, isScrollable]);

  return { tabRowRef };
};
