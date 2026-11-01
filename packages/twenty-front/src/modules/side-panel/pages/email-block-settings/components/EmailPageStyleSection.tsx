import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import {
  type CanvasTheme,
  isDefined,
  resolveCanvasTheme,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { useLiveEditorState } from '@/advanced-text-editor/hooks/useLiveEditorState';
import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { SidePanelGroupFormContainer } from '@/side-panel/components/SidePanelGroupFormContainer';
import { EmailBlockSettingsFieldInput } from '@/side-panel/pages/email-block-settings/components/EmailBlockSettingsFieldInput';
import {
  EmailBoxSidesInput,
  type CssBoxSides,
} from '@/side-panel/pages/email-block-settings/components/EmailBoxSidesInput';
import { EMAIL_BODY_THEME_FIELDS } from '@/side-panel/pages/email-block-settings/constants/EmailBodyThemeFields';
import { EMAIL_PAGE_THEME_FIELDS } from '@/side-panel/pages/email-block-settings/constants/EmailPageThemeFields';
import { themeBoxValueToSides } from '@/side-panel/pages/email-block-settings/utils/themeBoxValueToSides';
import { type EmailThemeField } from '@/side-panel/pages/email-block-settings/types/EmailThemeField';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
`;

const sidesToThemeBoxValue = ({ top, right, bottom, left }: CssBoxSides) =>
  top === right && right === bottom && bottom === left
    ? top
    : `${top} ${right} ${bottom} ${left}`;

type EmailPageStyleSectionProps = {
  editor: Editor;
};

export const EmailPageStyleSection = ({
  editor,
}: EmailPageStyleSectionProps) => {
  const { t, i18n } = useLingui();

  const canvasTheme = useLiveEditorState(editor, (currentEditor) =>
    resolveCanvasTheme(currentEditor.state.doc.attrs.canvasTheme),
  );

  if (!isDefined(canvasTheme)) {
    return (
      <StyledHint>
        {t`Select a section, columns, button or divider in the email body to edit its settings.`}
      </StyledHint>
    );
  }

  const setThemeValue = (themeKey: keyof CanvasTheme, value: string) => {
    editor
      .chain()
      .command(({ tr }) => {
        tr.setDocAttribute('canvasTheme', {
          ...canvasTheme,
          [themeKey]: value,
        });
        return true;
      })
      .run();
  };

  const renderThemeField = (field: EmailThemeField) => {
    if (field.input === 'box') {
      return (
        <EmailBoxSidesInput
          key={field.property}
          label={i18n._(field.label)}
          sides={themeBoxValueToSides(canvasTheme[field.property])}
          onChange={(sides) =>
            setThemeValue(field.property, sidesToThemeBoxValue(sides))
          }
          placeholder={field.placeholder}
        />
      );
    }

    return (
      <EmailBlockSettingsFieldInput
        key={field.property}
        field={field}
        value={canvasTheme[field.property]}
        onChange={(value) => setThemeValue(field.property, value)}
      />
    );
  };

  return (
    <StyledContainer>
      <CommandMenuItemSectionGroup heading={t`Page`}>
        <SidePanelGroupFormContainer>
          <StyledFields>
            {EMAIL_PAGE_THEME_FIELDS.map(renderThemeField)}
          </StyledFields>
        </SidePanelGroupFormContainer>
      </CommandMenuItemSectionGroup>
      <CommandMenuItemSectionGroup heading={t`Body`}>
        <SidePanelGroupFormContainer>
          <StyledFields>
            {EMAIL_BODY_THEME_FIELDS.map(renderThemeField)}
          </StyledFields>
        </SidePanelGroupFormContainer>
      </CommandMenuItemSectionGroup>
    </StyledContainer>
  );
};
