import { useActiveStyles, useBlockNoteEditor } from '@blocknote/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { Dropdown } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

import { DashboardColorIcon } from '@/page-layout/widgets/standalone-rich-text/components/DashboardColorIcon';
import { DashboardColorSelectionMenu } from '@/page-layout/widgets/standalone-rich-text/components/DashboardColorSelectionMenu';
import { type BlockNoteColor } from '@/page-layout/widgets/standalone-rich-text/types/BlockNoteColor';
import { extractColorFromProps } from '@/page-layout/widgets/standalone-rich-text/utils/extractColorFromProps';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

const StyledColorButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]};
  width: 24px;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

export const DashboardFormattingToolbarColorButton = () => {
  const editor = useBlockNoteEditor();
  const { t } = useLingui();
  const instanceId = useId();
  const activeStyles = useActiveStyles(editor);
  const currentTextColor = extractColorFromProps(activeStyles, 'text');
  const currentBackgroundColor = extractColorFromProps(
    activeStyles,
    'background',
  );

  const handleTextColorSelect = (color: BlockNoteColor) => {
    if (color === 'default') {
      editor.removeStyles({ textColor: color });
      return;
    }
    editor.addStyles({ textColor: color });
  };

  const handleBackgroundColorSelect = (color: BlockNoteColor) => {
    if (color === 'default') {
      editor.removeStyles({ backgroundColor: color });
      return;
    }
    editor.addStyles({ backgroundColor: color });
  };

  return (
    <DropdownRoot dropdownId={`dashboard-color-${instanceId}`} type="picker">
      <Dropdown.Trigger
        render={
          <StyledColorButton aria-label={t`Text and background colors`}>
            <DashboardColorIcon
              textColor={currentTextColor}
              backgroundColor={currentBackgroundColor}
            />
          </StyledColorButton>
        }
      />
      <DropdownContent
        sideOffset={8}
        className="bn-ui-container"
        aria-label={t`Text and background colors`}
        finalFocus={() => {
          editor.focus();
          return false;
        }}
      >
        <DashboardColorSelectionMenu
          currentTextColor={currentTextColor}
          currentBackgroundColor={currentBackgroundColor}
          onTextColorSelect={handleTextColorSelect}
          onBackgroundColorSelect={handleBackgroundColorSelect}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
