import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  PageLayoutTabLayoutMode,
  WidgetType,
} from '~/generated-metadata/graphql';

type ShouldWidgetFillCanvasTabParams = {
  widget: PageLayoutWidget;
  layoutMode: PageLayoutTabLayoutMode;
};

// A front component alone in a canvas tab owns the visible tab area and
// manages its own internal scroll. Every layer between the tab and the
// component must then keep its height definite so the component's percentage
// heights resolve. Other widget types (e.g. a timeline) keep the
// content-sized flow so long content reaches the tab's scroll wrapper.
export const shouldWidgetFillCanvasTab = ({
  widget,
  layoutMode,
}: ShouldWidgetFillCanvasTabParams) =>
  layoutMode === PageLayoutTabLayoutMode.CANVAS &&
  widget.type === WidgetType.FRONT_COMPONENT;
