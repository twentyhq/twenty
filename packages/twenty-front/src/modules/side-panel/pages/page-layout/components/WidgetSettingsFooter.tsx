import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useDuplicatePageLayoutWidget } from '@/page-layout/hooks/useDuplicatePageLayoutWidget';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { SidePanelOptionsDropdown } from '@/side-panel/components/SidePanelOptionsDropdown';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconCopyPlus, IconTrash } from 'twenty-ui/icon';

export const WidgetSettingsFooter = ({
  pageLayoutId,
}: {
  pageLayoutId: string;
}) => {
  const dropdownId = useId();
  const { t } = useLingui();
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
  };

  const handleDeleteWidget = () => {
    if (isDefined(pageLayoutEditingWidgetId)) {
      deletePageLayoutWidget(pageLayoutEditingWidgetId);
    }
  };

  return (
    <SidePanelFooter
      actions={[
        <SidePanelOptionsDropdown key="options" dropdownId={dropdownId}>
          <Dropdown.ActionItem
            onClick={handleDuplicateWidget}
            startIcon={<IconCopyPlus />}
          >
            {t`Duplicate widget`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            onClick={handleDeleteWidget}
            startIcon={<IconTrash />}
            color="danger"
          >
            {t`Delete widget`}
          </Dropdown.ActionItem>
        </SidePanelOptionsDropdown>,
      ]}
    />
  );
};
