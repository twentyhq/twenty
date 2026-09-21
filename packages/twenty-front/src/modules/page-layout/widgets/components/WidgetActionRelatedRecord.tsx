import { type RelatedRecordActionBinding } from '@/activities/types/RelatedRecordAction';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { IconPlus } from 'twenty-ui/icon';

type WidgetActionRelatedRecordProps = {
  binding: RelatedRecordActionBinding;
};

export const WidgetActionRelatedRecord = ({
  binding,
}: WidgetActionRelatedRecordProps) => {
  const { action, supportElement } = binding;

  if (!action.isVisible) {
    return null;
  }

  return (
    <>
      {supportElement}
      <WidgetCardHeaderActionButton
        Icon={IconPlus}
        label={action.disabledReason ?? action.label}
        onClick={action.execute}
        disabled={action.disabled}
      />
    </>
  );
};
