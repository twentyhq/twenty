import { type Manifest } from 'twenty-shared/application';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getPageLayoutDeprecationWarnings = (
  manifest: Pick<Manifest, 'pageLayouts' | 'pageLayoutTabs'>,
): string[] => {
  const warnings: string[] = [];
  const tabs = [
    ...manifest.pageLayouts.flatMap(({ tabs }) => tabs ?? []),
    ...manifest.pageLayoutTabs,
  ];

  for (const tab of tabs) {
    if (tab.layoutMode === PageLayoutTabLayoutMode.CANVAS) {
      warnings.push(
        `Page layout tab "${tab.title}" uses deprecated CANVAS. For a full-height widget, use VERTICAL_LIST and set the widget's heightBehavior to 'TAB_VIEWPORT'. Existing Canvas layouts remain supported and are not converted.`,
      );
    }

    for (const widget of tab.widgets ?? []) {
      if (
        widget.position?.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
      ) {
        warnings.push(
          `Page layout widget "${widget.title}" uses a deprecated vertical-list position. Order the widgets array by position.index, remove position, and move any position.heightBehavior to heightBehavior. Existing positions remain supported and keep their indices.`,
        );
      }

      if ('gridPosition' in widget && isDefined(widget.gridPosition)) {
        warnings.push(
          `Page layout widget "${widget.title}" uses deprecated gridPosition. Use position with layoutMode: 'GRID' and the same row, column, rowSpan and columnSpan. Existing gridPosition remains supported.`,
        );
      }
    }
  }

  return warnings;
};
