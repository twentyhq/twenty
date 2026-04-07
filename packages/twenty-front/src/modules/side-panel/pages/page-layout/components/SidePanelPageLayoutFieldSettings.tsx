import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { FieldWidgetFieldDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/FieldWidgetFieldDropdownContent';
import { FieldWidgetLayoutDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/FieldWidgetLayoutDropdownContent';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLayoutSidebarRight, IconListDetails } from 'twenty-ui/display';
import {
  FieldDisplayMode,
  type FieldConfiguration,
} from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledSidePanelContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

export const SidePanelPageLayoutFieldSettings = () => {
  const { t } = useLingui();
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const fieldConfiguration = widgetInEditMode?.configuration as
    | FieldConfiguration
    | undefined;

  const currentFieldMetadataId = fieldConfiguration?.fieldMetadataId;
  const currentDisplayMode = fieldConfiguration?.fieldDisplayMode;

  const { fieldMetadataItem: currentFieldMetadataItem } =
    useFieldMetadataItemById(currentFieldMetadataId ?? '');

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const fieldLabel = currentFieldMetadataItem?.label ?? '';

  const displayModeLabels: Record<string, string> = {
    [FieldDisplayMode.FIELD]: t`Field`,
    [FieldDisplayMode.CARD]: t`Card`,
  };

  const layoutLabel = isDefined(currentDisplayMode)
    ? (displayModeLabels[currentDisplayMode] ?? '')
    : '';

  const selectableItemIds = ['field', 'layout'];

  return (
    <StyledContainer>
      <StyledSidePanelContainer>
        <SidePanelList commandGroups={[]} selectableItemIds={selectableItemIds}>
          <SidePanelGroup heading={t`Data and display`}>
            <SelectableListItem itemId="field">
              <CommandMenuItemDropdown
                id="field"
                label={t`Field`}
                Icon={IconListDetails}
                dropdownId="field"
                dropdownComponents={
                  <DropdownContent>
                    <FieldWidgetFieldDropdownContent />
                  </DropdownContent>
                }
                dropdownPlacement="bottom-end"
                description={fieldLabel}
                contextualTextPosition="right"
              />
            </SelectableListItem>
            <SelectableListItem itemId="layout">
              <CommandMenuItemDropdown
                id="layout"
                label={t`Layout`}
                Icon={IconLayoutSidebarRight}
                dropdownId="layout"
                dropdownComponents={
                  <DropdownContent>
                    <FieldWidgetLayoutDropdownContent />
                  </DropdownContent>
                }
                dropdownPlacement="bottom-end"
                description={layoutLabel}
                contextualTextPosition="right"
              />
            </SelectableListItem>
          </SidePanelGroup>
        </SidePanelList>
      </StyledSidePanelContainer>
      <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
    </StyledContainer>
  );
};
