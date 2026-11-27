import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconEye, IconEyeX } from 'twenty-ui/icon';

type WidgetVisibilitySubPageItemProps = {
  itemId: string;
  widget: Pick<PageLayoutWidget, 'conditionalAvailability'> | undefined;
};

export const WidgetVisibilitySubPageItem = ({
  itemId,
  widget,
}: WidgetVisibilitySubPageItemProps) => {
  const { t } = useLingui();
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  const hasConditionalAvailability = isDefined(widget?.conditionalAvailability);

  const handleClick = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutWidgetVisibility);
  };

  return (
    <SelectableListItem itemId={itemId} onEnter={handleClick}>
      <CommandMenuItem
        id={itemId}
        label={t`Visibility`}
        Icon={hasConditionalAvailability ? IconEyeX : IconEye}
        hasSubMenu
        onClick={handleClick}
        description={hasConditionalAvailability ? t`Custom rule` : t`Everyone`}
        contextualTextPosition="right"
      />
    </SelectableListItem>
  );
};
