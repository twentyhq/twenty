import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useConditionalAvailabilityVisibilityStatus } from '@/conditional-availability/hooks/useConditionalAvailabilityVisibilityStatus';
import { getConditionalAvailabilityEditorItemKey } from '@/conditional-availability/utils/getConditionalAvailabilityEditorItemKey';
import { getConditionalAvailabilityValueIcon } from '@/conditional-availability/utils/getConditionalAvailabilityValueIcon';
import { getConditionalAvailabilityValueLabel } from '@/conditional-availability/utils/getConditionalAvailabilityValueLabel';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

type PageLayoutSettingsVisibilityItemProps = {
  widgetId: string;
  node: ConditionalAvailabilityNode | null;
  selectableItemId: string;
};

export const PageLayoutSettingsVisibilityItem = ({
  widgetId,
  node,
  selectableItemId,
}: PageLayoutSettingsVisibilityItemProps) => {
  const { t } = useLingui();
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  const visibilityStatus = useConditionalAvailabilityVisibilityStatus({
    itemKey: getConditionalAvailabilityEditorItemKey({
      metadataName: 'pageLayoutWidget',
      itemId: widgetId,
    }),
    node,
  });

  const openVisibility = () =>
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutWidgetVisibility);

  return (
    <SelectableListItem itemId={selectableItemId} onEnter={openVisibility}>
      <CommandMenuItem
        id={selectableItemId}
        Icon={getConditionalAvailabilityValueIcon({ visibilityStatus })}
        label={t`Visibility`}
        description={getConditionalAvailabilityValueLabel({ visibilityStatus })}
        contextualTextPosition="right"
        hasSubMenu
        onClick={openVisibility}
      />
    </SelectableListItem>
  );
};
