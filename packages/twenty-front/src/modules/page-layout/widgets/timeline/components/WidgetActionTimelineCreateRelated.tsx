import { useRelatedRecordActions } from '@/activities/hooks/useRelatedRecordActions';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useOpenCreateRelatedRecordInSidePanel } from '@/side-panel/hooks/useOpenCreateRelatedRecordInSidePanel';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';

export const WidgetActionTimelineCreateRelated = () => {
  const targetRecord = useTargetRecord();
  const hasAnyRelatedRecordAction = useRelatedRecordActions({
    targetRecord,
  }).some(({ action }) => action.isVisible);
  const { openCreateRelatedRecordInSidePanel } =
    useOpenCreateRelatedRecordInSidePanel();

  if (!hasAnyRelatedRecordAction) {
    return null;
  }

  return (
    <WidgetCardHeaderActionButton
      Icon={IconPlus}
      label={t`Create related`}
      onClick={() => openCreateRelatedRecordInSidePanel(targetRecord)}
    />
  );
};
