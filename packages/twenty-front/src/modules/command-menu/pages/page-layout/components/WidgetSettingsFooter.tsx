import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useDuplicatePageLayoutWidget } from '@/page-layout/hooks/useDuplicatePageLayoutWidget';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCopyPlus, IconTrash } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

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
  const editingWidgetId = useRecoilComponentValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const handleDuplicateWidget = () => {
    if (isDefined(editingWidgetId)) {
      duplicateWidget(editingWidgetId);
    }
    closeDropdown(dropdownId);
  };

  const handleDeleteWidget = () => {
    if (isDefined(editingWidgetId)) {
      deletePageLayoutWidget(editingWidgetId);
    }
    closeDropdown(dropdownId);
  };

  const selectedItemId = useRecoilComponentValueV2(
    selectedItemIdComponentState,
    dropdownId,
  );

  return (
    <RightDrawerFooter
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
            <MenuItem
              focused={selectedItemId === 'duplicate-widget'}
              onClick={handleDuplicateWidget}
              text={t`Duplicate widget`}
              LeftIcon={IconCopyPlus}
            />
          </SelectableListItem>

          <SelectableListItem
            itemId="delete-widget"
            onEnter={handleDeleteWidget}
          >
            <MenuItem
              focused={selectedItemId === 'delete-widget'}
              onClick={handleDeleteWidget}
              text={t`Delete widget`}
              LeftIcon={IconTrash}
              accent="danger"
            />
          </SelectableListItem>
        </OptionsDropdownMenu>,
      ]}
    />
  );
};
