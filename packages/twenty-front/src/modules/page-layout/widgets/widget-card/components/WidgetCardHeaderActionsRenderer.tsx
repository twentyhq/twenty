import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WIDGET_HEADER_ACTION_COMPONENT_BY_WIDGET_TYPE } from '@/page-layout/widgets/constants/WidgetHeaderActionComponentByWidgetType';
import { useCurrentWidgetOrNull } from '@/page-layout/widgets/hooks/useCurrentWidgetOrNull';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { isDefined } from 'twenty-shared/utils';

type WidgetCardHeaderWidgetActionsProps = {
  widget: PageLayoutWidget;
};

const WidgetCardHeaderWidgetActions = ({
  widget,
}: WidgetCardHeaderWidgetActionsProps) => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  if (!isDefined(targetRecordIdentifier)) {
    return null;
  }

  const HeaderActionComponent =
    WIDGET_HEADER_ACTION_COMPONENT_BY_WIDGET_TYPE[widget.type];

  if (!isDefined(HeaderActionComponent)) {
    return null;
  }

  return <HeaderActionComponent />;
};

export const WidgetCardHeaderActionsRenderer = () => {
  const widget = useCurrentWidgetOrNull();

  if (!isDefined(widget)) {
    return null;
  }

  return <WidgetCardHeaderWidgetActions widget={widget} />;
};
