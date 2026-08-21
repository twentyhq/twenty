import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type WidgetHeightMode } from '@/page-layout/widgets/types/WidgetHeightMode';
import { WidgetType } from '~/generated-metadata/graphql';

export const getWidgetHeightMode = ({
  widget,
}: {
  widget: Pick<PageLayoutWidget, 'type'>;
}): WidgetHeightMode => {
  switch (widget.type) {
    case WidgetType.CALL_RECORDING_TRANSCRIPT:
      return 'filling';
    default:
      return 'flowing';
  }
};
