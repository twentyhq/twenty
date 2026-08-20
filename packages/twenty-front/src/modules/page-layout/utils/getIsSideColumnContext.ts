type GetIsSideColumnContextParams = {
  isInPinnedTab: boolean;
  isMobile: boolean;
  isInSidePanel: boolean;
};

export const getIsSideColumnContext = ({
  isInPinnedTab,
  isMobile,
  isInSidePanel,
}: GetIsSideColumnContextParams): boolean =>
  isInPinnedTab || isMobile || isInSidePanel;
