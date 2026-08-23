import { useTimelineActivityTypes } from '@/activities/timeline-activities/hooks/useTimelineActivityTypes';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/icon';

export const WidgetActionTimelineFilter = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { activeTimelineActivityTypes } = useTimelineActivityTypes();
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const setSidePanelSearch = useSetAtomState(sidePanelSearchState);

  if (!isNonEmptyArray(activeTimelineActivityTypes)) {
    return null;
  }

  const openTimelineFilter = () => {
    setSidePanelSearch('');
    navigateSidePanelMenu({
      page: SidePanelPages.TimelineFilter,
      pageTitle: t`Filter timeline`,
      pageIcon: IconFilter,
      pageId: targetRecord.id,
      resetNavigationStack: true,
    });
  };

  return (
    <WidgetCardHeaderActionButton
      Icon={IconFilter}
      label={t`Filter timeline`}
      onClick={openTimelineFilter}
    />
  );
};
