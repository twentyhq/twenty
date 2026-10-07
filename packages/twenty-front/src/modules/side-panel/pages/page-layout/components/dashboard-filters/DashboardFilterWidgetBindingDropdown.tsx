import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useSetWidgetDashboardFilterBinding } from '@/page-layout/dashboard-filters/hooks/useSetWidgetDashboardFilterBinding';
import { getDashboardFilterBindingLabel } from '@/page-layout/dashboard-filters/utils/getDashboardFilterBindingLabel';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { DashboardFilterBindingFieldDropdownContent } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFilterBindingFieldDropdownContent';
import { getDashboardFilterWidgetBindingItemId } from '@/side-panel/pages/page-layout/utils/getDashboardFilterWidgetBindingItemId';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconChartBar, useIcons } from 'twenty-ui/icon';

type DashboardFilterWidgetBindingDropdownProps = {
  pageLayoutId: string;
  slot: DashboardFilterSlot;
  slotRelationTargetObjectMetadataId: string | undefined;
  widget: PageLayoutWidget;
  binding: DashboardFilterBinding | null;
};

export const DashboardFilterWidgetBindingDropdown = ({
  pageLayoutId,
  slot,
  slotRelationTargetObjectMetadataId,
  widget,
  binding,
}: DashboardFilterWidgetBindingDropdownProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === widget.objectMetadataId,
  );

  const { setWidgetDashboardFilterBinding } =
    useSetWidgetDashboardFilterBinding(pageLayoutId);

  const itemId = getDashboardFilterWidgetBindingItemId(widget.id);

  const handleBindingChange = (nextBinding: DashboardFilterBinding | null) => {
    setWidgetDashboardFilterBinding({
      widgetId: widget.id,
      slotId: slot.id,
      binding: nextBinding,
    });
  };

  const description = isDefined(binding)
    ? getDashboardFilterBindingLabel({ binding, objectMetadataItems })
    : t`Not applied`;

  return (
    <CommandMenuItemDropdown
      id={itemId}
      dropdownId={itemId}
      label={widget.title}
      Icon={
        isDefined(objectMetadataItem)
          ? getIcon(objectMetadataItem.icon)
          : IconChartBar
      }
      description={description}
      contextualTextPosition="right"
      dropdownPlacement="bottom-end"
      disabled={!isDefined(objectMetadataItem)}
      dropdownComponents={
        isDefined(objectMetadataItem) ? (
          <LegacyDropdownContent>
            <DashboardFilterBindingFieldDropdownContent
              slot={slot}
              slotRelationTargetObjectMetadataId={
                slotRelationTargetObjectMetadataId
              }
              objectMetadataItem={objectMetadataItem}
              binding={binding}
              onBindingChange={handleBindingChange}
            />
          </LegacyDropdownContent>
        ) : (
          <></>
        )
      }
    />
  );
};
