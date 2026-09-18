import { ListItem } from 'twenty-ui/primitives/navigation';
import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useDuplicatePageLayoutWidget } from '@/page-layout/hooks/useDuplicatePageLayoutWidget';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/components';
import { IconCopyPlus, IconTrash } from 'twenty-ui/icon';

export const WidgetSettingsFooter = ({
  pageLayoutId,
}: {
  pageLayoutId: string;
}) => {
  const dropdownId = useId();
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const { duplicateWidget } = useDuplicatePageLayoutWidget(pageLayoutId);
  const { deletePageLayoutWidget } = useDeletePageLayoutWidget(pageLayoutId);
  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const handleDuplicateWidget = () => {
    if (isDefined(pageLayoutEditingWidgetId)) {
      duplicateWidget(pageLayoutEditingWidgetId);
    }
    closeDropdown(dropdownId);
  };

  const handleDeleteWidget = () => {
    if (isDefined(pageLayoutEditingWidgetId)) {
      deletePageLayoutWidget(pageLayoutEditingWidgetId);
    }
    closeDropdown(dropdownId);
  };

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  return (
    <SidePanelFooter
      actions={[
        <OptionsDropdownMenu
          key="options"
          dropdownId={dropdownId}
          selectableListId={dropdownId}
          selectableItemIdArray={['duplicate-widget', 'delete-widget']}
        >
          <SelectableListItem
            itemId="duplicate-widget"
            onEnter={handleDuplicateWidget}
          >
            <ListItem
              focused={selectedItemId === 'duplicate-widget'}
              onClick={handleDuplicateWidget}
              startIcon={<IconCopyPlus />}
            >{t`Duplicate widget`}</ListItem>
          </SelectableListItem>

          <SelectableListItem
            itemId="delete-widget"
            onEnter={handleDeleteWidget}
          >
            <ListItem
              focused={selectedItemId === 'delete-widget'}
              onClick={handleDeleteWidget}
              startIcon={<IconTrash />}
              color="danger"
            >{t`Delete widget`}</ListItem>
          </SelectableListItem>
        </OptionsDropdownMenu>,
      ]}
    />
  );
};
