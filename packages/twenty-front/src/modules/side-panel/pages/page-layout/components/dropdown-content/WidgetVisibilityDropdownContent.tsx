import { EXPRESSION_DEVICE_DESKTOP } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceDesktop';
import { EXPRESSION_DEVICE_MOBILE } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceMobile';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { MenuItemSelect } from 'twenty-ui/navigation';

const VISIBILITY_ANY_DEVICE = 'any-device';
const VISIBILITY_MOBILE = 'mobile';
const VISIBILITY_DESKTOP = 'desktop';

const VISIBILITY_OPTIONS = [
  { id: VISIBILITY_ANY_DEVICE },
  { id: VISIBILITY_MOBILE },
  { id: VISIBILITY_DESKTOP },
] as const;

const expressionToOptionId = (
  expression: string | null | undefined,
): string => {
  if (!expression) {
    return VISIBILITY_ANY_DEVICE;
  }

  if (expression === EXPRESSION_DEVICE_MOBILE) {
    return VISIBILITY_MOBILE;
  }

  if (expression === EXPRESSION_DEVICE_DESKTOP) {
    return VISIBILITY_DESKTOP;
  }

  return VISIBILITY_ANY_DEVICE;
};

const optionIdToExpression = (optionId: string): string | null => {
  switch (optionId) {
    case VISIBILITY_MOBILE:
      return EXPRESSION_DEVICE_MOBILE;
    case VISIBILITY_DESKTOP:
      return EXPRESSION_DEVICE_DESKTOP;
    default:
      return null;
  }
};

export const WidgetVisibilityDropdownContent = () => {
  const { t } = useLingui();

  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const currentOptionId = expressionToOptionId(
    widgetInEditMode?.conditionalAvailabilityExpression,
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const handleSelectVisibility = (optionId: string) => {
    updateCurrentWidgetConfig({
      conditionalAvailabilityExpression: optionIdToExpression(optionId),
    });
    closeDropdown();
  };

  const visibilityLabels: Record<string, string> = {
    [VISIBILITY_ANY_DEVICE]: t`Any device`,
    [VISIBILITY_MOBILE]: t`Mobile`,
    [VISIBILITY_DESKTOP]: t`Desktop`,
  };

  return (
    <DropdownMenuItemsContainer>
      <SelectableList
        selectableListInstanceId={dropdownId}
        focusId={dropdownId}
        selectableItemIdArray={VISIBILITY_OPTIONS.map((option) => option.id)}
      >
        {VISIBILITY_OPTIONS.map((option) => (
          <SelectableListItem
            key={option.id}
            itemId={option.id}
            onEnter={() => {
              handleSelectVisibility(option.id);
            }}
          >
            <MenuItemSelect
              text={visibilityLabels[option.id]}
              selected={currentOptionId === option.id}
              focused={selectedItemId === option.id}
              onClick={() => {
                handleSelectVisibility(option.id);
              }}
            />
          </SelectableListItem>
        ))}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
