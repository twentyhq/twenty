import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetFieldActions } from '@/page-layout/widgets/components/WidgetFieldActions';
import { WIDGET_HEADER_ACTION_COMPONENT_BY_WIDGET_TYPE } from '@/page-layout/widgets/constants/WidgetHeaderActionComponentByWidgetType';
import { useCurrentWidgetOrNull } from '@/page-layout/widgets/hooks/useCurrentWidgetOrNull';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

type WidgetCardHeaderWidgetActionsProps = {
  widget: PageLayoutWidget;
  isInEditMode: boolean;
};

const WidgetCardHeaderWidgetActions = ({
  widget,
  isInEditMode,
}: WidgetCardHeaderWidgetActionsProps) => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  if (!isDefined(targetRecordIdentifier)) {
    return null;
  }

  if (widget.type === WidgetType.FIELD) {
    return <WidgetFieldActions />;
  }

  const HeaderActionComponent =
    WIDGET_HEADER_ACTION_COMPONENT_BY_WIDGET_TYPE[widget.type];

  if (!isDefined(HeaderActionComponent) || isInEditMode) {
    return null;
  }

  return <HeaderActionComponent />;
};

type WidgetCardHeaderActionsRendererProps = {
  isInEditMode: boolean;
};

export const WidgetCardHeaderActionsRenderer = ({
  isInEditMode,
}: WidgetCardHeaderActionsRendererProps) => {
  const widget = useCurrentWidgetOrNull();

  if (!isDefined(widget)) {
    return null;
  }

  return (
    <WidgetCardHeaderWidgetActions
      widget={widget}
      isInEditMode={isInEditMode}
    />
  );
};
