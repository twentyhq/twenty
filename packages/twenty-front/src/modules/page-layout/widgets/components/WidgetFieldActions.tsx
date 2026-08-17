import { WidgetActionRenderer } from '@/page-layout/widgets/components/WidgetActionRenderer';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { useWidgetActions } from '@/page-layout/widgets/hooks/useWidgetActions';

export const WidgetFieldActions = () => {
  const widget = useCurrentWidget();
  const actions = useWidgetActions({ widget });

  return (
    <>
      {actions.map((action) => (
        <WidgetActionRenderer key={action.id} action={action} />
      ))}
    </>
  );
};
