import styled from '@emotion/styled';
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
import { useTheme } from '@emotion/react';

const StyledColorMenuItem = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledColorName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledCheckIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
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
  const theme = useTheme();
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
