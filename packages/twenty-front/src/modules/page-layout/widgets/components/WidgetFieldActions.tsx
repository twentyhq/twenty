import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetActionFieldEdit } from '@/page-layout/widgets/components/WidgetActionFieldEdit';
import { WidgetActionFieldSeeAll } from '@/page-layout/widgets/components/WidgetActionFieldSeeAll';
import { useFieldWidgetActionVisibility } from '@/page-layout/widgets/field/hooks/useFieldWidgetActionVisibility';

type WidgetFieldActionsProps = {
  widget: PageLayoutWidget;
};

export const WidgetFieldActions = ({ widget }: WidgetFieldActionsProps) => {
  const { showSeeAll, showEdit } = useFieldWidgetActionVisibility({ widget });

  return (
    <>
      {showSeeAll && <WidgetActionFieldSeeAll widget={widget} />}
      {showEdit && <WidgetActionFieldEdit widget={widget} />}
    </>
  );
};
