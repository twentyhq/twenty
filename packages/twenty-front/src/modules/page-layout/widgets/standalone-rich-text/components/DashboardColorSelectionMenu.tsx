import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components';

import { DashboardColorIcon } from '@/page-layout/widgets/standalone-rich-text/components/DashboardColorIcon';
import { BLOCKNOTE_COLOR_DISPLAY_NAMES } from '@/page-layout/widgets/standalone-rich-text/constants/BlockNoteColorDisplayNames';
import { BLOCKNOTE_COLORS } from '@/page-layout/widgets/standalone-rich-text/constants/BlockNoteColors';
import { type BlockNoteColor } from '@/page-layout/widgets/standalone-rich-text/types/BlockNoteColor';

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

  return (
    <>
      <Dropdown.Section label={t`Text Colors`}>
        {BLOCKNOTE_COLORS.map((colorName) => (
          <Dropdown.OptionItem
            key={colorName}
            aria-label={BLOCKNOTE_COLOR_DISPLAY_NAMES[colorName]}
            selected={currentTextColor === colorName}
            startIcon={<DashboardColorIcon textColor={colorName} />}
            onSelect={() => onTextColorSelect(colorName)}
          >
            {BLOCKNOTE_COLOR_DISPLAY_NAMES[colorName]}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
      <Dropdown.Separator />
      <Dropdown.Section label={t`Background Colors`}>
        {BLOCKNOTE_COLORS.map((colorName) => (
          <Dropdown.OptionItem
            key={colorName}
            aria-label={BLOCKNOTE_COLOR_DISPLAY_NAMES[colorName]}
            selected={currentBackgroundColor === colorName}
            startIcon={<DashboardColorIcon backgroundColor={colorName} />}
            onSelect={() => onBackgroundColorSelect(colorName)}
          >
            {BLOCKNOTE_COLOR_DISPLAY_NAMES[colorName]}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </>
  );
};
