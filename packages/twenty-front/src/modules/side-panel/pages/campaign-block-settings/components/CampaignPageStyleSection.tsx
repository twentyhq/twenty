import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { isDefined, isEmailTheme } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CampaignBlockSettingsFieldInput } from '@/side-panel/pages/campaign-block-settings/components/CampaignBlockSettingsFieldInput';
import { CAMPAIGN_PAGE_STYLE_FIELDS } from '@/side-panel/pages/campaign-block-settings/constants/CampaignPageStyleFields';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]};
`;

type CampaignPageStyleSectionProps = {
  editor: Editor;
};

export const CampaignPageStyleSection = ({
  editor,
}: CampaignPageStyleSectionProps) => {
  const { t } = useLingui();

  const emailTheme = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      const theme = currentEditor.state.doc.attrs.emailTheme;
      return isEmailTheme(theme) ? theme : null;
    },
  });

  if (!isDefined(emailTheme)) {
    return (
      <StyledHint>
        {t`Select a section, columns, button or divider in the email body to edit its settings.`}
      </StyledHint>
    );
  }

  const handleThemeChange = (themeKey: string, value: string) => {
    editor
      .chain()
      .command(({ tr }) => {
        tr.setDocAttribute('emailTheme', {
          ...emailTheme,
          [themeKey]: value,
        });
        return true;
      })
      .run();
  };

  return (
    <StyledContainer>
      <StyledTitle>{t`Page style`}</StyledTitle>
      {CAMPAIGN_PAGE_STYLE_FIELDS.map((field) => (
        <CampaignBlockSettingsFieldInput
          key={field.themeKey}
          field={field}
          value={emailTheme[field.themeKey]}
          onChange={(value) => handleThemeChange(field.themeKey, value)}
        />
      ))}
    </StyledContainer>
  );
};
