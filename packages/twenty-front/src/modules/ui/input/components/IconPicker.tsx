import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactElement, useMemo, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  Dropdown,
  IconButton,
  LightIconButton,
  getIconTileColorShades,
} from 'twenty-ui/components';
import { IconApps, type IconComponent, useIcons } from 'twenty-ui/icon';
import { ColorSample } from 'twenty-ui/primitives/data-display';
import {
  type ButtonSize,
  type ButtonVariant,
} from 'twenty-ui/primitives/input';
import { type ThemeColor, themeCssVariables } from 'twenty-ui/theme';

import { ThemeColorPickerMenu } from '@/ui/input/components/ThemeColorPickerMenu';
import { ICON_PICKER_DROPDOWN_CONTENT_WIDTH } from '@/ui/input/components/constants/IconPickerDropdownContentWidth';
import { ICON_PICKER_DEFAULT_VISIBLE_COUNT } from '@/ui/input/components/constants/IconPickerDefaultVisibleCount';
import { IconPickerScrollEffect } from '@/ui/input/effect-components/IconPickerScrollEffect';
import { iconPickerVisibleCountState } from '@/ui/input/states/iconPickerVisibleCountState';
import { getIconPickerLabel } from '@/ui/input/utils/getIconPickerLabel';
import { getIconPickerSearchScore } from '@/ui/input/utils/getIconPickerSearchScore';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';

type IconPickerProps = {
  disabled?: boolean;
  dropdownId?: string;
  onChange: (params: { iconKey: string; Icon: IconComponent }) => void;
  selectedIconKey?: string;
  onClose?: () => void;
  onOpen?: () => void;
  variant?: ButtonVariant;
  className?: string;
  size?: ButtonSize;
  clickableComponent?: ReactElement;
  dropdownWidth?: number;
  dropdownSideOffset?: number;
  maxIconsVisible?: number;
  iconColor?: ThemeColor;
  iconColorPicker?: {
    selectedColor: ThemeColor;
    onColorChange: (color: ThemeColor) => void;
  };
};

const ICON_CELL_WIDTH = 32;
const ICON_GRID_GAP = 2;
const ICON_GRID_PADDING = 8;

const StyledSearchRow = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[2]};
  width: 100%;

  > :first-child {
    flex: 1;
    min-width: 0;
  }
`;

const StyledPopupContent = styled.div`
  display: contents;
`;

const iconButtonStyles = css`
  &[data-selected] {
    background: ${themeCssVariables.background.transparent.medium};
  }
`;

export const IconPicker = ({
  disabled,
  dropdownId = 'icon-picker',
  onChange,
  selectedIconKey,
  onClose,
  onOpen,
  variant = 'outline',
  className,
  size = 'md',
  clickableComponent,
  dropdownWidth = ICON_PICKER_DROPDOWN_CONTENT_WIDTH,
  dropdownSideOffset,
  maxIconsVisible = ICON_PICKER_DEFAULT_VISIBLE_COUNT,
  iconColorPicker,
  iconColor,
}: IconPickerProps) => {
  const [searchString, setSearchString] = useState('');
  const [visibleCount, setVisibleCount] = useAtomFamilyState(
    iconPickerVisibleCountState,
    dropdownId,
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { getIcons, getIcon } = useIcons();
  const icons = getIcons();
  const matchingIconKeys = useMemo(() => {
    if (!isDefined(icons)) {
      return [];
    }

    const matchingIcons = Object.keys(icons)
      .map((iconKey) => ({
        iconKey,
        score: getIconPickerSearchScore({ iconKey, search: searchString }),
      }))
      .filter(({ score }) => score > 0)
      .sort((first, second) => second.score - first.score)
      .map(({ iconKey }) => iconKey);

    if (
      !isDefined(selectedIconKey) ||
      !matchingIcons.includes(selectedIconKey)
    ) {
      return matchingIcons;
    }

    return [
      selectedIconKey,
      ...matchingIcons.filter((iconKey) => iconKey !== selectedIconKey),
    ];
  }, [icons, searchString, selectedIconKey]);
  const visibleIconKeys = matchingIconKeys.slice(0, visibleCount);
  const isLoadingMore = visibleCount < matchingIconKeys.length;
  const columns = Math.max(
    1,
    Math.floor(
      (dropdownWidth - ICON_GRID_PADDING + ICON_GRID_GAP) /
        (ICON_CELL_WIDTH + ICON_GRID_GAP),
    ),
  );
  const DisplayIcon = isNonEmptyString(selectedIconKey)
    ? getIcon(selectedIconKey)
    : IconApps;
  const selectedColor = iconColorPicker?.selectedColor ?? iconColor;
  const displayColor = isDefined(selectedColor)
    ? getIconTileColorShades(selectedColor).iconColor
    : undefined;
  const iconAriaLabel = isNonEmptyString(selectedIconKey)
    ? t`(selected: ${selectedIconKey})`
    : t`(no icon selected)`;
  const colorDropdownId = `${dropdownId}-icon-color-picker`;

  return (
    <div className={className}>
      <DropdownRoot
        dropdownId={dropdownId}
        type="picker"
        onOpenChange={(open) => {
          if (!open) {
            onClose?.();
            return;
          }

          setSearchString('');
          setVisibleCount(maxIconsVisible);
          onOpen?.();
        }}
      >
        <Dropdown.Trigger
          disabled={disabled}
          nativeButton={!isDefined(clickableComponent)}
          render={
            clickableComponent ?? (
              <IconButton
                aria-label={t`Click to select icon ${iconAriaLabel}`}
                variant={variant}
                size={size}
              >
                <DisplayIcon color={displayColor} />
              </IconButton>
            )
          }
        />
        <DropdownContent
          aria-label={t`Choose icon`}
          align="end"
          width={dropdownWidth}
          sideOffset={dropdownSideOffset}
        >
          <StyledPopupContent data-click-outside-id={dropdownId}>
            <StyledSearchRow>
              <Dropdown.Search
                aria-label={t`Search icon`}
                placeholder={t`Search icon`}
                value={searchString}
                onValueChange={setSearchString}
              />
              {isDefined(iconColorPicker) && (
                <DropdownRoot dropdownId={colorDropdownId} type="picker">
                  <Dropdown.Trigger
                    render={
                      <LightIconButton aria-label={t`Choose icon color`}>
                        <ColorSample
                          colorName={iconColorPicker.selectedColor}
                          variant="circle"
                        />
                      </LightIconButton>
                    }
                  />
                  <DropdownContent
                    side="right"
                    align="start"
                    sideOffset={-24}
                    alignOffset={24}
                    width={dropdownWidth}
                  >
                    <StyledPopupContent data-click-outside-id={colorDropdownId}>
                      <ThemeColorPickerMenu
                        selectedColor={iconColorPicker.selectedColor}
                        onSelectColor={iconColorPicker.onColorChange}
                      />
                    </StyledPopupContent>
                  </DropdownContent>
                </DropdownRoot>
              )}
            </StyledSearchRow>
            <Dropdown.Separator />
            <Dropdown.Section
              scrollable
              ref={scrollContainerRef}
              aria-label={t`Icons`}
            >
              <Dropdown.Section columns={columns}>
                {visibleIconKeys.map((iconKey) => {
                  const Icon = getIcon(iconKey);

                  return (
                    <Dropdown.OptionItem
                      key={iconKey}
                      aria-label={getIconPickerLabel(iconKey)}
                      title={iconKey}
                      selected={iconKey === selectedIconKey}
                      indicator="none"
                      nativeButton
                      className={iconButtonStyles}
                      render={
                        <LightIconButton
                          size="md"
                          aria-label={getIconPickerLabel(iconKey)}
                        >
                          <Icon color={displayColor} />
                        </LightIconButton>
                      }
                      onSelect={() => onChange({ iconKey, Icon })}
                    />
                  );
                })}
              </Dropdown.Section>
              <div ref={sentinelRef}>
                {isLoadingMore && (
                  <Dropdown.Loading>{t`Loading more...`}</Dropdown.Loading>
                )}
              </div>
              <IconPickerScrollEffect
                dropdownId={dropdownId}
                sentinelRef={sentinelRef}
                scrollContainerRef={scrollContainerRef}
                enabled={isLoadingMore}
              />
            </Dropdown.Section>
          </StyledPopupContent>
        </DropdownContent>
      </DropdownRoot>
    </div>
  );
};
