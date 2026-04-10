import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { getFieldWidgetAvailableDisplayModes } from '@/page-layout/widgets/field/utils/getFieldWidgetDisplayModeConfig';
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
import { useMemo } from 'react';
import {
  type IconComponent,
  IconFileText,
  IconLayoutKanban,
  IconListDetails,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import {
  FieldDisplayMode,
  type FieldConfiguration,
} from '~/generated-metadata/graphql';

const DISPLAY_MODE_ICONS: Record<FieldDisplayMode, IconComponent> = {
  [FieldDisplayMode.FIELD]: IconListDetails,
  [FieldDisplayMode.CARD]: IconLayoutKanban,
  [FieldDisplayMode.EDITOR]: IconFileText,
  [FieldDisplayMode.VIEW]: IconListDetails,
};

export const FieldWidgetLayoutDropdownContent = () => {
  const { t } = useLingui();

  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const fieldConfiguration = widgetInEditMode?.configuration as
    | FieldConfiguration
    | undefined;

  const currentDisplayMode = fieldConfiguration?.fieldDisplayMode;
  const currentFieldMetadataId = fieldConfiguration?.fieldMetadataId;

  const { fieldMetadataItem } = useFieldMetadataItemById(
    currentFieldMetadataId ?? '',
  );

  const layoutOptions = useMemo(
    () =>
      fieldMetadataItem
        ? getFieldWidgetAvailableDisplayModes(fieldMetadataItem.type)
        : [FieldDisplayMode.FIELD],
    [fieldMetadataItem],
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

  const handleSelectLayout = (fieldDisplayMode: FieldDisplayMode) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        fieldDisplayMode,
      },
    });
    closeDropdown();
  };

  const layoutLabels: Record<string, string> = {
    [FieldDisplayMode.FIELD]: t`Field`,
    [FieldDisplayMode.CARD]: t`Card`,
    [FieldDisplayMode.EDITOR]: t`Editor`,
  };

  return (
    <DropdownMenuItemsContainer>
      <SelectableList
        selectableListInstanceId={dropdownId}
        focusId={dropdownId}
        selectableItemIdArray={layoutOptions}
      >
        {layoutOptions.map((displayMode) => (
          <SelectableListItem
            key={displayMode}
            itemId={displayMode}
            onEnter={() => {
              handleSelectLayout(displayMode);
            }}
          >
            <MenuItemSelect
              text={layoutLabels[displayMode]}
              selected={currentDisplayMode === displayMode}
              focused={selectedItemId === displayMode}
              LeftIcon={DISPLAY_MODE_ICONS[displayMode]}
              onClick={() => {
                handleSelectLayout(displayMode);
              }}
            />
          </SelectableListItem>
        ))}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
