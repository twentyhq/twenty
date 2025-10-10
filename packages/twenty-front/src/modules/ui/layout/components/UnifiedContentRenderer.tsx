import { type CardConfiguration } from '@/object-record/record-show/types/CardConfiguration';
import { type CardType } from '@/object-record/record-show/types/CardType';
import { getCardComponent } from '@/object-record/record-show/utils/getCardComponent';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { type PageLayoutWidget } from '~/generated/graphql';

// Unified content type that can represent either a card or a widget
export type UnifiedContentType =
  | { type: 'card'; cardType: CardType; configuration?: CardConfiguration }
  | { type: 'widget'; widget: PageLayoutWidget };

export type UnifiedContentRendererProps = {
  content: UnifiedContentType;
};

// Unified renderer that can handle both cards (record pages) and widgets (dashboards)
// Cards get context from LayoutRenderingContext, widgets are self-contained
// eslint-disable-next-line @nx/workspace-effect-components
export const UnifiedContentRenderer = ({
  content,
}: UnifiedContentRendererProps) => {
  if (content.type === 'card') {
    return getCardComponent(content.cardType, content.configuration);
  }

  if (content.type === 'widget') {
    return <WidgetContentRenderer widget={content.widget} />;
  }

  return null;
};
