import { type WidgetAction } from '@/page-layout/widgets/types/WidgetAction';
import { CustomError } from 'twenty-shared/utils';
import { WidgetType } from '~/generated/graphql';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { WidgetActionFieldEdit } from './WidgetActionFieldEdit';

type WidgetActionRendererProps = {
  action: WidgetAction;
};

export const WidgetActionRenderer = ({ action }: WidgetActionRendererProps) => {
  const widget = useCurrentWidget();

  if (action.id === 'edit' && widget.type === WidgetType.FIELD) {
    return <WidgetActionFieldEdit />;
  }

  throw new CustomError(
    `Unsupported action renderer for action id: ${action.id}`,
    'UNSUPPORTED_WIDGET_ACTION_RENDERER',
  );
};
