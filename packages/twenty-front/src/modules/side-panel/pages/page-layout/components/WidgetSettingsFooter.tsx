import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useDuplicatePageLayoutWidget } from '@/page-layout/hooks/useDuplicatePageLayoutWidget';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCopyPlus, IconTrash } from 'twenty-ui/icon';
import { Menu } from 'twenty-ui/primitives/surfaces';

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
  return (
    <SidePanelFooter
      actions={[
        <OptionsDropdownMenu key="options" dropdownId={dropdownId}>
          <Menu.Item
            onClick={handleDuplicateWidget}
            startIcon={<IconCopyPlus />}
          >{t`Duplicate widget`}</Menu.Item>

          <Menu.Item
            onClick={handleDeleteWidget}
            startIcon={<IconTrash />}
            color="danger"
          >{t`Delete widget`}</Menu.Item>
        </OptionsDropdownMenu>,
      ]}
    />
  );
};
