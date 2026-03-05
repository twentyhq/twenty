import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCheck } from 'twenty-ui/display';

import { DashboardColorIcon } from '@/page-layout/widgets/standalone-rich-text/components/DashboardColorIcon';
import { BLOCKNOTE_COLOR_DISPLAY_NAMES } from '@/page-layout/widgets/standalone-rich-text/constants/BlockNoteColorDisplayNames';
import { BLOCKNOTE_COLORS } from '@/page-layout/widgets/standalone-rich-text/constants/BlockNoteColors';
import { type BlockNoteColor } from '@/page-layout/widgets/standalone-rich-text/types/BlockNoteColor';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme-constants';
import { useContext } from 'react';

const StyledColorMenuItem = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledColorName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledCheckIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  height: ${themeCssVariables.spacing[4]};
  justify-content: center;
  width: ${themeCssVariables.spacing[4]};
`;

type DashboardColorSelectionMenuProps = {
  currentTextColor: string;
  currentBackgroundColor: string;
  onTextColorSelect: (color: BlockNoteColor) => void;
  onBackgroundColorSelect: (color: BlockNoteColor) => void;
};

export const DashboardColorSelectionMenu = ({
  currentTextColor,
  currentBackgroundColor,
  onTextColorSelect,
  onBackgroundColorSelect,
}: DashboardColorSelectionMenuProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  return (
    <DropdownContent>
      <DropdownMenuItemsContainer hasMaxHeight>
        <DropdownMenuSectionLabel label={t`Text Colors`} />

        {BLOCKNOTE_COLORS.map((colorName) => (
          <StyledColorMenuItem
            key={`text-${colorName}`}
            onClick={() => onTextColorSelect(colorName)}
          >
            <DashboardColorIcon textColor={colorName} />
            <StyledColorName>
              {BLOCKNOTE_COLOR_DISPLAY_NAMES[colorName]}
            </StyledColorName>
            {currentTextColor === colorName && (
              <StyledCheckIcon>
                <IconCheck size={theme.icon.size.sm} />
              </StyledCheckIcon>
            )}
          </StyledColorMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuSectionLabel label={t`Background Colors`} />
        {BLOCKNOTE_COLORS.map((colorName) => (
          <StyledColorMenuItem
            key={`bg-${colorName}`}
            onClick={() => onBackgroundColorSelect(colorName)}
          >
            <DashboardColorIcon backgroundColor={colorName} />
            <StyledColorName>
              {BLOCKNOTE_COLOR_DISPLAY_NAMES[colorName]}
            </StyledColorName>
            {currentBackgroundColor === colorName && (
              <StyledCheckIcon>
                <IconCheck size={theme.icon.size.sm} />
              </StyledCheckIcon>
            )}
          </StyledColorMenuItem>
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
