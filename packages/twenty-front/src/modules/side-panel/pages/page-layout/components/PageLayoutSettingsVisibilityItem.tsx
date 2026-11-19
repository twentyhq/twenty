import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useConditionalAvailabilityVisibilityStatus } from '@/conditional-availability/hooks/useConditionalAvailabilityVisibilityStatus';
import { getConditionalAvailabilityEditorItemKey } from '@/conditional-availability/utils/getConditionalAvailabilityEditorItemKey';
import { getConditionalAvailabilityVisibilityStatusIcon } from '@/conditional-availability/utils/getConditionalAvailabilityVisibilityStatusIcon';
import { getConditionalAvailabilityVisibilityStatusLabel } from '@/conditional-availability/utils/getConditionalAvailabilityVisibilityStatusLabel';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';

type PageLayoutSettingsVisibilityItemProps = {
  widget: PageLayoutWidget;
  selectableItemId: string;
};

export const PageLayoutSettingsVisibilityItem = ({
  widget,
  selectableItemId,
}: PageLayoutSettingsVisibilityItemProps) => {
  const { t } = useLingui();
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  const visibilityStatus = useConditionalAvailabilityVisibilityStatus({
    itemKey: getConditionalAvailabilityEditorItemKey({
      metadataName: 'pageLayoutWidget',
      itemId: widget.id,
    }),
    node: widget.conditionalAvailability ?? null,
  });

  const openVisibility = () =>
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutWidgetVisibility);

  return (
    <SelectableListItem itemId={selectableItemId} onEnter={openVisibility}>
      <CommandMenuItem
        id={selectableItemId}
        Icon={getConditionalAvailabilityVisibilityStatusIcon({
          visibilityStatus,
        })}
        label={t`Visibility`}
        description={getConditionalAvailabilityVisibilityStatusLabel({
          visibilityStatus,
        })}
        contextualTextPosition="right"
        hasSubMenu
        onClick={openVisibility}
      />
    </SelectableListItem>
  );
};
