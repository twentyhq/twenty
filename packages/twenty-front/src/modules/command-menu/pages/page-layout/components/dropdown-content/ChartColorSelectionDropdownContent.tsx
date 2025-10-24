import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { generateGroupColor } from '@/page-layout/widgets/graph/utils/generateGroupColor';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { MenuItemSelect } from 'twenty-ui/navigation';
import {
  MAIN_COLOR_NAMES,
  MAIN_COLORS,
  type ThemeColor,
} from 'twenty-ui/theme';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type ColorOption = {
  id: string;
  name: string;
  colorName: ThemeColor | 'auto';
};

const StyledColorSample = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  border-radius: 60px;
  flex-shrink: 0;
  height: ${({ theme }) => theme.spacing(4)};
  width: ${({ theme }) => theme.spacing(3)};
`;

const StyledColorSamplesContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const COLOR_GROUP_COUNT = 5;

export const ChartColorSelectionDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  if (widgetInEditMode.configuration?.__typename === 'IframeConfiguration') {
    throw new Error('Invalid configuration type');
  }

  const configuration = widgetInEditMode.configuration as ChartConfiguration;

  if (!('color' in configuration)) {
    return null;
  }

  const currentColor = configuration.color;

  const colorOptions: ColorOption[] = [
    {
      id: 'auto',
      name: 'Auto',
      colorName: 'auto',
    },
    ...MAIN_COLOR_NAMES.map((colorName) => ({
      id: colorName,
      name: capitalize(colorName),
      colorName: colorName,
    })),
  ];

  const filteredColorOptions = filterBySearchQuery({
    items: colorOptions,
    searchQuery,
    getSearchableValues: (item) => [item.name],
  });

  const handleSelectColor = (colorName: ThemeColor | 'auto') => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        color: colorName,
      },
    });
    closeDropdown();
  };

  return (
    <>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search colors`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={filteredColorOptions.map(
            (colorOption) => colorOption.id,
          )}
        >
          {filteredColorOptions.map((colorOption) => {
            const colorName = colorOption.colorName;
            const colorSamples =
              colorName !== 'auto' ? (
                <StyledColorSamplesContainer>
                  {Array.from({ length: COLOR_GROUP_COUNT }).map((_, index) => {
                    const baseColor = MAIN_COLORS[colorName];
                    const reversedIndex = COLOR_GROUP_COUNT - 1 - index;
                    const groupColor = generateGroupColor(
                      baseColor,
                      reversedIndex,
                      COLOR_GROUP_COUNT,
                    );
                    return <StyledColorSample key={index} color={groupColor} />;
                  })}
                </StyledColorSamplesContainer>
              ) : undefined;
            return (
              <SelectableListItem
                key={colorOption.id}
                itemId={colorOption.id}
                onEnter={() => {
                  handleSelectColor(colorOption.colorName);
                }}
              >
                <MenuItemSelect
                  text={colorOption.name}
                  selected={false}
                  focused={
                    selectedItemId === colorOption.id ||
                    currentColor === colorOption.id
                  }
                  contextualText={colorSamples}
                  contextualTextPosition="right"
                  onClick={() => {
                    handleSelectColor(colorOption.colorName);
                  }}
                />
              </SelectableListItem>
            );
          })}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
