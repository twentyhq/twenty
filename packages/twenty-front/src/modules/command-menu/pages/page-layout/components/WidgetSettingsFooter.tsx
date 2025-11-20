import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useDuplicatePageLayoutWidget } from '@/page-layout/hooks/useDuplicatePageLayoutWidget';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCopyPlus } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export const WidgetSettingsFooter = () => {
  const dropdownId = useId();
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();

  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { duplicateWidget } = useDuplicatePageLayoutWidget(pageLayoutId);

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

  const selectedItemId = useRecoilComponentValue(
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
          selectableItemIdArray={['duplicate-widget']}
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
        </OptionsDropdownMenu>,
      ]}
    />
  );
};
