import {
  getPageLayoutTabManifestLayoutMode,
  getPageLayoutWidgetManifestPosition,
  type PageLayoutManifest,
  type PageLayoutTabManifest,
} from 'twenty-shared/application';

const addTabWidgetPositions = ({
  pageLayoutTabManifest,
  pageLayoutType,
}: {
  pageLayoutTabManifest: PageLayoutTabManifest;
  pageLayoutType: PageLayoutManifest['type'] | undefined;
}): PageLayoutTabManifest => {
  if (!pageLayoutTabManifest.widgets) {
    return pageLayoutTabManifest;
  }

  const pageLayoutTabLayoutMode = getPageLayoutTabManifestLayoutMode({
    pageLayoutTabManifest,
    pageLayoutType,
  });

  return {
    ...pageLayoutTabManifest,
    widgets: pageLayoutTabManifest.widgets.map(
      (pageLayoutWidgetManifest, widgetIndex) => ({
        ...pageLayoutWidgetManifest,
        position: getPageLayoutWidgetManifestPosition({
          pageLayoutWidgetManifest,
          pageLayoutTabLayoutMode,
          widgetIndex,
        }),
      }),
    ),
  };
};

// Widget placement is declared through the widgets array order and the tab layout mode,
// so the built manifest resolves it into an explicit position instead of letting each
// server version infer it
export const addMissingPageLayoutWidgetPositions = ({
  pageLayouts,
  pageLayoutTabs,
}: {
  pageLayouts: PageLayoutManifest[];
  pageLayoutTabs: PageLayoutTabManifest[];
}): {
  pageLayouts: PageLayoutManifest[];
  pageLayoutTabs: PageLayoutTabManifest[];
} => ({
  pageLayouts: pageLayouts.map((pageLayoutManifest) => ({
    ...pageLayoutManifest,
    tabs: pageLayoutManifest.tabs?.map((pageLayoutTabManifest) =>
      addTabWidgetPositions({
        pageLayoutTabManifest,
        pageLayoutType: pageLayoutManifest.type,
      }),
    ),
  })),
  pageLayoutTabs: pageLayoutTabs.map((pageLayoutTabManifest) =>
    addTabWidgetPositions({
      pageLayoutTabManifest,
      pageLayoutType: pageLayouts.find(
        (pageLayoutManifest) =>
          pageLayoutManifest.universalIdentifier ===
          pageLayoutTabManifest.pageLayoutUniversalIdentifier,
      )?.type,
    }),
  ),
});
