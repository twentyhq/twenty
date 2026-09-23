import { SIDE_PANEL_CLICK_OUTSIDE_ID } from '@/side-panel/constants/SidePanelClickOutsideId';
import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useDuplicatePageLayoutWidget } from '@/page-layout/hooks/useDuplicatePageLayoutWidget';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useSidePanelOptionsHotkeys } from '@/side-panel/hooks/useSidePanelOptionsHotkeys';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, IconButton } from 'twenty-ui/components';
import { IconCopyPlus, IconDotsVertical, IconTrash } from 'twenty-ui/icon';

export const WidgetSettingsFooter = ({
  pageLayoutId,
}: {
  pageLayoutId: string;
}) => {
  const dropdownId = useId();
  const { handleContentKeyDown } = useSidePanelOptionsHotkeys(dropdownId);
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
        <DropdownRoot
          key="options"
          dropdownId={dropdownId}
          type="menu"
          globalHotkeysConfig={{ enableGlobalHotkeysWithModifiers: true }}
        >
          <Dropdown.Trigger
            data-select-disable
            render={
              <IconButton aria-label={t`Options`} size="sm" variant="outline">
                <IconDotsVertical />
              </IconButton>
            }
          />
          <Dropdown.Content
            data-click-outside-id={SIDE_PANEL_CLICK_OUTSIDE_ID}
            side="top"
            align="end"
            sideOffset={8}
            onKeyDown={handleContentKeyDown}
          >
            <Dropdown.Section>
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
            </Dropdown.Section>
          </Dropdown.Content>
        </DropdownRoot>,
      ]}
    />
  );
};
