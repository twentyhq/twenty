import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetFieldActions } from '@/page-layout/widgets/components/WidgetFieldActions';
import { WidgetActionEmailCompose } from '@/page-layout/widgets/emails/components/WidgetActionEmailCompose';
import { WidgetActionFileAttach } from '@/page-layout/widgets/files/components/WidgetActionFileAttach';
import { WidgetActionNoteCreate } from '@/page-layout/widgets/notes/components/WidgetActionNoteCreate';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { WidgetActionTaskCreate } from '@/page-layout/widgets/tasks/components/WidgetActionTaskCreate';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
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

  switch (widget.type) {
    case WidgetType.FIELD:
      return <WidgetFieldActions />;
    case WidgetType.EMAILS:
      return isInEditMode ? null : <WidgetActionEmailCompose />;
    case WidgetType.TASKS:
      return isInEditMode ? null : <WidgetActionTaskCreate />;
    case WidgetType.NOTES:
      return isInEditMode ? null : <WidgetActionNoteCreate />;
    case WidgetType.FILES:
      return isInEditMode ? null : <WidgetActionFileAttach />;
    default:
      return null;
  }
};

type WidgetCardHeaderActionsRendererProps = {
  isInEditMode: boolean;
};

export const WidgetCardHeaderActionsRenderer = ({
  isInEditMode,
}: WidgetCardHeaderActionsRendererProps) => {
  const widgetComponentInstanceId = useComponentInstanceStateContext(
    WidgetComponentInstanceContext,
  );

  const { currentPageLayout } = useCurrentPageLayout();

  const widget = currentPageLayout?.tabs
    ?.flatMap((tab) => tab.widgets)
    .find(
      (tabWidget) => tabWidget.id === widgetComponentInstanceId?.instanceId,
    );

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
