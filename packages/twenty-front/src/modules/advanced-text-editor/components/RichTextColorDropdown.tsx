import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { useId } from 'react';
import {
  isDefined,
  RICH_TEXT_COLORS,
  type RichTextColor,
} from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useTheme } from 'twenty-ui/theme';

import { RichTextColorIcon } from '@/advanced-text-editor/components/RichTextColorIcon';
import { RICH_TEXT_COLOR_DISPLAY_NAMES } from '@/advanced-text-editor/constants/RichTextColorDisplayNames';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

type RichTextColorDropdownProps = {
  editor: Editor;
  textColor: RichTextColor | null;
  backgroundColor: RichTextColor | null;
};

export const RichTextColorDropdown = ({
  editor,
  textColor,
  backgroundColor,
}: RichTextColorDropdownProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const instanceId = useId();

  const colorOptions = [null, ...RICH_TEXT_COLORS];

  const getColorLabel = (color: RichTextColor | null) =>
    isDefined(color) ? t(RICH_TEXT_COLOR_DISPLAY_NAMES[color]) : t`Default`;

  const handleColorSelect = ({
    attributeName,
    color,
  }: {
    attributeName: 'textColor' | 'backgroundColor';
    color: RichTextColor | null;
  }) => {
    editor
      .chain()
      .focus()
      .setMark('textStyle', { [attributeName]: color })
      .removeEmptyTextStyle()
      .run();
  };

  const renderColorOptions = ({
    attributeName,
    selectedColor,
  }: {
    attributeName: 'textColor' | 'backgroundColor';
    selectedColor: RichTextColor | null;
  }) =>
    colorOptions.map((color) => (
      <Dropdown.OptionItem
        key={color ?? 'default'}
        aria-label={getColorLabel(color)}
        selected={selectedColor === color}
        startIcon={<RichTextColorIcon {...{ [attributeName]: color }} />}
        onSelect={() => handleColorSelect({ attributeName, color })}
      >
        {getColorLabel(color)}
      </Dropdown.OptionItem>
    ));

  return (
    <DropdownRoot
      dropdownId={`rich-text-color-dropdown-${instanceId}`}
      type="picker"
    >
      <Dropdown.Trigger
        render={
          <LightIconButton
            aria-label={t`Text and background colors`}
            variant="ghost"
            size="sm"
          >
            <RichTextColorIcon
              textColor={textColor}
              backgroundColor={backgroundColor}
            />
          </LightIconButton>
        }
      />
      <DropdownContent
        align="end"
        sideOffset={parseInt(theme.spacing[1], 10)}
        finalFocus={() => editor.view.dom}
        aria-label={t`Text and background colors`}
      >
        <Dropdown.Section label={t`Text Colors`}>
          {renderColorOptions({
            attributeName: 'textColor',
            selectedColor: textColor,
          })}
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section label={t`Background Colors`}>
          {renderColorOptions({
            attributeName: 'backgroundColor',
            selectedColor: backgroundColor,
          })}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
