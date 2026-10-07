import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemSwitch } from '@/command-menu/components/CommandMenuItemSwitch';
import { CommandMenuItemTextInput } from '@/command-menu/components/CommandMenuItemTextInput';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { DASHBOARD_FILTER_LABEL_MAX_LENGTH } from '@/page-layout/dashboard-filters/constants/DashboardFilterLabelMaxLength';
import { useDashboardFilterSlotsForPageLayout } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlotsForPageLayout';
import { useRemoveDashboardFilterSlot } from '@/page-layout/dashboard-filters/hooks/useRemoveDashboardFilterSlot';
import { useUpdatePageLayoutDashboardFilters } from '@/page-layout/dashboard-filters/hooks/useUpdatePageLayoutDashboardFilters';
import { getDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRepresentativeBinding';
import { getDashboardFilterSlotRelationTargetObjectMetadataId } from '@/page-layout/dashboard-filters/utils/getDashboardFilterSlotRelationTargetObjectMetadataId';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { DashboardFilterDefaultValueDropdown } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFilterDefaultValueDropdown';
import { DashboardFilterWidgetBindingDropdown } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFilterWidgetBindingDropdown';
import { DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/DashboardFilterSettingsSelectableItemIds';
import { getDashboardFilterWidgetBindingItemId } from '@/side-panel/pages/page-layout/utils/getDashboardFilterWidgetBindingItemId';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconExclamationCircle, IconTag, IconTrash } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { WidgetType } from '~/generated-metadata/graphql';

const DELETE_DASHBOARD_FILTER_DIALOG_ID = 'delete-dashboard-filter-dialog';

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

type SidePanelDashboardFilterDetailSubPageContentProps = {
  pageLayoutId: string;
  slot: DashboardFilterSlot;
};

export const SidePanelDashboardFilterDetailSubPageContent = ({
  pageLayoutId,
  slot,
}: SidePanelDashboardFilterDetailSubPageContentProps) => {
  const { t } = useLingui();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { bindingsByWidgetId } =
    useDashboardFilterSlotsForPageLayout(pageLayoutId);

  const { updatePageLayoutDashboardFilterSlot } =
    useUpdatePageLayoutDashboardFilters(pageLayoutId);

  const { removeDashboardFilterSlot } =
    useRemoveDashboardFilterSlot(pageLayoutId);

  const { goBackFromSidePanelSubPage } = useSidePanelSubPageHistory();
  const { openDialog } = useDialog();

  // The text input keeps its own draft, so a rejected commit remounts it on the stored label.
  const [labelInputResetCount, setLabelInputResetCount] = useState(0);

  const graphWidgets = pageLayoutDraft.tabs
    .flatMap((tab) => tab.widgets)
    .filter(
      (widget) =>
        widget.type === WidgetType.GRAPH && isDefined(widget.objectMetadataId),
    );

  const representativeBinding = getDashboardFilterRepresentativeBinding({
    slotId: slot.id,
    bindingsByWidgetId,
    objectMetadataItems,
  });

  const slotRelationTargetObjectMetadataId =
    slot.filterType === 'RELATION'
      ? getDashboardFilterSlotRelationTargetObjectMetadataId({
          slotId: slot.id,
          bindingsByWidgetId,
          objectMetadataItems,
        })
      : undefined;

  // A required filter only gates the charts it is bound to, so one bound to none blocks nothing.
  const isRequiredWithoutBinding =
    slot.isRequired === true &&
    !graphWidgets.some((widget) =>
      isDefined(bindingsByWidgetId[widget.id]?.[slot.id]),
    );

  const selectableItemIds = [
    DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.LABEL,
    DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.DEFAULT_VALUE,
    DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.REQUIRED,
    ...graphWidgets.map((widget) =>
      getDashboardFilterWidgetBindingItemId(widget.id),
    ),
    DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.DELETE,
  ];

  const handleLabelChange = (label: string) => {
    const trimmedLabel = label.trim();

    if (!isNonEmptyString(trimmedLabel)) {
      setLabelInputResetCount((previousResetCount) => previousResetCount + 1);
      return;
    }

    updatePageLayoutDashboardFilterSlot(slot.id, {
      label: trimmedLabel.slice(0, DASHBOARD_FILTER_LABEL_MAX_LENGTH),
    });
  };

  const handleRequiredChange = (isRequired: boolean) => {
    updatePageLayoutDashboardFilterSlot(slot.id, { isRequired });
  };

  const handleDeleteClick = () => {
    openDialog(DELETE_DASHBOARD_FILTER_DIALOG_ID);
  };

  const handleConfirmDelete = () => {
    removeDashboardFilterSlot(slot.id);
    goBackFromSidePanelSubPage();
  };

  return (
    <>
      <SidePanelList selectableItemIds={selectableItemIds}>
        <SidePanelGroup heading={t`Filter`}>
          <SelectableListItem
            itemId={DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.LABEL}
          >
            <CommandMenuItemTextInput
              key={`${slot.label}-${labelInputResetCount}`}
              id={DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.LABEL}
              label={t`Label`}
              Icon={IconTag}
              value={slot.label}
              onChange={handleLabelChange}
              placeholder={t`Filter label`}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId={DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.DEFAULT_VALUE}
          >
            <DashboardFilterDefaultValueDropdown
              pageLayoutId={pageLayoutId}
              slot={slot}
              representativeBinding={representativeBinding}
              relationTargetObjectMetadataId={
                slotRelationTargetObjectMetadataId
              }
            />
          </SelectableListItem>
          <SelectableListItem
            itemId={DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.REQUIRED}
          >
            <CommandMenuItemSwitch
              id={DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.REQUIRED}
              LeftIcon={IconExclamationCircle}
              text={t`Required`}
              checked={slot.isRequired ?? false}
              onCheckedChange={handleRequiredChange}
            />
          </SelectableListItem>
        </SidePanelGroup>
        <SidePanelGroup heading={t`Applies to`}>
          {isRequiredWithoutBinding && (
            <StyledHint>{t`This filter is not applied to any chart yet`}</StyledHint>
          )}
          {graphWidgets.map((widget) => (
            <SelectableListItem
              key={widget.id}
              itemId={getDashboardFilterWidgetBindingItemId(widget.id)}
            >
              <DashboardFilterWidgetBindingDropdown
                pageLayoutId={pageLayoutId}
                slot={slot}
                slotRelationTargetObjectMetadataId={
                  slotRelationTargetObjectMetadataId
                }
                widget={widget}
                binding={bindingsByWidgetId[widget.id]?.[slot.id] ?? null}
              />
            </SelectableListItem>
          ))}
        </SidePanelGroup>
        <SidePanelGroup heading={t`Manage`}>
          <SelectableListItem
            itemId={DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.DELETE}
            onEnter={handleDeleteClick}
          >
            <CommandMenuItem
              id={DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.DELETE}
              Icon={IconTrash}
              label={t`Delete filter`}
              onClick={handleDeleteClick}
            />
          </SelectableListItem>
        </SidePanelGroup>
      </SidePanelList>
      <ConfirmationDialog
        dialogId={DELETE_DASHBOARD_FILTER_DIALOG_ID}
        title={t`Delete filter`}
        subtitle={t`This removes the filter from the dashboard and from every chart it applies to.`}
        onConfirmClick={handleConfirmDelete}
        confirmButtonText={t`Delete`}
        confirmButtonColor="danger"
      />
    </>
  );
};
