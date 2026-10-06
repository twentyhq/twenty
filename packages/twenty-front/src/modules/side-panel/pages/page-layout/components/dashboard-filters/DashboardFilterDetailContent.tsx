import { CommandMenuItemSwitch } from '@/command-menu/components/CommandMenuItemSwitch';
import { CommandMenuItemTextInput } from '@/command-menu/components/CommandMenuItemTextInput';
import { useDashboardFilterEditor } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterEditor';
import { useDashboardFilterEditorActions } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterEditorActions';
import { findDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/findDashboardFilterRepresentativeBinding';
import { getDashboardFilterBindingLabel } from '@/page-layout/dashboard-filters/utils/getDashboardFilterBindingLabel';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { DashboardFilterDefaultValueRow } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFilterDefaultValueRow';
import { DashboardFilterWidgetBindingRow } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFilterWidgetBindingRow';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconExclamationCircle, IconTag } from 'twenty-ui/icon';

const LABEL_ITEM_ID = 'dashboard-filter-label';
const REQUIRED_ITEM_ID = 'dashboard-filter-required';
const DEFAULT_VALUE_ITEM_ID = 'dashboard-filter-default-value';

type DashboardFilterDetailContentProps = {
  pageLayoutId: string;
  slot: DashboardFilterSlot;
};

export const DashboardFilterDetailContent = ({
  pageLayoutId,
  slot,
}: DashboardFilterDetailContentProps) => {
  const { chartWidgets, bindingsByWidgetId } =
    useDashboardFilterEditor(pageLayoutId);

  const { updateSlot, setWidgetBinding } =
    useDashboardFilterEditorActions(pageLayoutId);

  const { objectMetadataItems } = useObjectMetadataItems();

  // A binding whose field was deleted since cannot drive the filter inputs; another chart's binding does.
  const representativeBinding = findDashboardFilterRepresentativeBinding({
    slotId: slot.id,
    bindingsByWidgetId,
    isBindingUsable: (binding) =>
      isDefined(
        getDashboardFilterBindingLabel({ binding, objectMetadataItems }),
      ),
  });

  // The server rejects a blank label, so an emptied input keeps the previous one.
  const handleLabelChange = (label: string) => {
    const trimmedLabel = label.trim();

    if (isNonEmptyString(trimmedLabel) && trimmedLabel !== slot.label) {
      updateSlot(slot.id, { label: trimmedLabel });
    }
  };

  const handleRequiredChange = () => {
    updateSlot(slot.id, { isRequired: slot.isRequired !== true });
  };

  const selectableItemIds = [
    LABEL_ITEM_ID,
    REQUIRED_ITEM_ID,
    DEFAULT_VALUE_ITEM_ID,
    ...chartWidgets.map((widget) => widget.id),
  ];

  return (
    <SidePanelList selectableItemIds={selectableItemIds}>
      <SelectableListItem itemId={LABEL_ITEM_ID}>
        {/* The input keeps its own draft and never resyncs, so a trimmed or rejected edit is replaced by remounting on the stored label. */}
        <CommandMenuItemTextInput
          key={slot.label}
          id={LABEL_ITEM_ID}
          label={t`Label`}
          Icon={IconTag}
          value={slot.label}
          onChange={handleLabelChange}
          placeholder={t`Filter label`}
        />
      </SelectableListItem>
      <SelectableListItem
        itemId={REQUIRED_ITEM_ID}
        onEnter={handleRequiredChange}
      >
        <CommandMenuItemSwitch
          id={REQUIRED_ITEM_ID}
          LeftIcon={IconExclamationCircle}
          text={t`Required`}
          checked={slot.isRequired === true}
          onCheckedChange={handleRequiredChange}
        />
      </SelectableListItem>
      <DashboardFilterDefaultValueRow
        itemId={DEFAULT_VALUE_ITEM_ID}
        pageLayoutId={pageLayoutId}
        slot={slot}
        representativeBinding={representativeBinding}
        onDefaultValueChange={(defaultValue) =>
          updateSlot(slot.id, { defaultValue })
        }
      />
      <SidePanelGroup heading={t`Charts`}>
        {chartWidgets.map((widget) => (
          <DashboardFilterWidgetBindingRow
            key={widget.id}
            slot={slot}
            widget={widget}
            binding={bindingsByWidgetId[widget.id]?.[slot.id] ?? null}
            onBindingChange={(binding) =>
              setWidgetBinding({
                widgetId: widget.id,
                slotId: slot.id,
                binding,
              })
            }
          />
        ))}
      </SidePanelGroup>
    </SidePanelList>
  );
};
