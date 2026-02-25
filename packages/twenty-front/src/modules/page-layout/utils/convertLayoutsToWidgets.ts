import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type Layouts } from 'react-grid-layout';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const convertLayoutsToWidgets = (
  widgets: PageLayoutWidget[],
  layouts: Layouts,
): PageLayoutWidget[] => {
  const activeLayouts = layouts.desktop || layouts.mobile || [];

  return widgets.map((widget) => {
    const layout = activeLayouts.find((l) => l.i === widget.id);

    const row = layout?.y ?? 0;
    const column = layout?.x ?? 0;
    const rowSpan = layout?.h ?? 2;
    const columnSpan = layout?.w ?? 2;

    return {
      ...widget,
      gridPosition: {
        row,
        column,
        rowSpan,
        columnSpan,
      },
      position: {
        __typename: 'PageLayoutWidgetGridPosition' as const,
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row,
        column,
        rowSpan,
        columnSpan,
      },
    };
  });
};
