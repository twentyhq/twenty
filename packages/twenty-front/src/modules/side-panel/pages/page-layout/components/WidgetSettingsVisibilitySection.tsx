import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { WidgetVisibilityDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityDropdownContent';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconEye } from 'twenty-ui/display';

const EXPRESSION_DEVICE_MOBILE = 'device == "MOBILE"';
const EXPRESSION_DEVICE_DESKTOP = 'device == "DESKTOP"';

const getVisibilityLabel = (
  expression: string | null | undefined,
  labels: { anyDevice: string; mobile: string; desktop: string },
): string => {
  if (!isDefined(expression)) {
    return labels.anyDevice;
  }

  if (expression === EXPRESSION_DEVICE_MOBILE) {
    return labels.mobile;
  }

  if (expression === EXPRESSION_DEVICE_DESKTOP) {
    return labels.desktop;
  }

  return labels.anyDevice;
};

export const WIDGET_SETTINGS_VISIBILITY_SELECTABLE_ITEM_ID =
  'visibility-restriction';

type WidgetSettingsVisibilitySectionProps = {
  pageLayoutId: string;
};

export const WidgetSettingsVisibilitySection = ({
  pageLayoutId,
}: WidgetSettingsVisibilitySectionProps) => {
  const { t } = useLingui();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const visibilityLabel = getVisibilityLabel(
    widgetInEditMode.conditionalAvailabilityExpression,
    {
      anyDevice: t`Any device`,
      mobile: t`Mobile`,
      desktop: t`Desktop`,
    },
  );

  return (
    <SidePanelGroup heading={t`Visibility`}>
      <SelectableListItem
        itemId={WIDGET_SETTINGS_VISIBILITY_SELECTABLE_ITEM_ID}
      >
        <CommandMenuItemDropdown
          id={WIDGET_SETTINGS_VISIBILITY_SELECTABLE_ITEM_ID}
          label={t`Device`}
          Icon={IconEye}
          dropdownId={WIDGET_SETTINGS_VISIBILITY_SELECTABLE_ITEM_ID}
          dropdownComponents={
            <DropdownContent>
              <WidgetVisibilityDropdownContent />
            </DropdownContent>
          }
          dropdownPlacement="bottom-end"
          description={visibilityLabel}
          contextualTextPosition="right"
        />
      </SelectableListItem>
    </SidePanelGroup>
  );
};
