import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import {
  type CanvasTheme,
  isDefined,
  resolveCanvasTheme,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CampaignBlockSettingsFieldInput } from '@/side-panel/pages/campaign-block-settings/components/CampaignBlockSettingsFieldInput';
import {
  CampaignBoxSidesInput,
  type CssBoxSides,
} from '@/side-panel/pages/campaign-block-settings/components/CampaignBoxSidesInput';
import { CAMPAIGN_BODY_THEME_FIELDS } from '@/side-panel/pages/campaign-block-settings/constants/CampaignBodyThemeFields';
import { CAMPAIGN_PAGE_THEME_FIELDS } from '@/side-panel/pages/campaign-block-settings/constants/CampaignPageThemeFields';
import { type CampaignThemeField } from '@/side-panel/pages/campaign-block-settings/types/CampaignThemeField';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledGroupTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};

  &:not(:first-child) {
    margin-top: ${themeCssVariables.spacing[3]};
  }
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]};
`;

// Theme box values are single CSS values ('24px') or four space-separated
// sides, always written by the counterpart below - no shorthand rules apply.
const themeBoxValueToSides = (value: string): CssBoxSides => {
  const tokens = value.trim().split(/\s+/);

  if (tokens.length === 4) {
    return {
      top: tokens[0],
      right: tokens[1],
      bottom: tokens[2],
      left: tokens[3],
    };
  }

  return { top: value, right: value, bottom: value, left: value };
};

const sidesToThemeBoxValue = ({ top, right, bottom, left }: CssBoxSides) =>
  top === right && right === bottom && bottom === left
    ? top
    : `${top} ${right} ${bottom} ${left}`;

type CampaignPageStyleSectionProps = {
  editor: Editor;
};

// The panel's default state, mirroring Resend's "Page style": the page
// behind the email, then the email body itself. Both groups render through
// the same field inputs as a selected block, so a control added for one
// surface is available to the other.
export const CampaignPageStyleSection = ({
  editor,
}: CampaignPageStyleSectionProps) => {
  const { t, i18n } = useLingui();

  const canvasTheme = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      resolveCanvasTheme(currentEditor.state.doc.attrs.canvasTheme),
  });

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

  const renderThemeField = (field: CampaignThemeField) => {
    if (field.input === 'box') {
      return (
        <CampaignBoxSidesInput
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
      <CampaignBlockSettingsFieldInput
        key={field.property}
        field={field}
        value={canvasTheme[field.property]}
        onChange={(value) => setThemeValue(field.property, value)}
      />
    );
  };

  return (
    <StyledContainer>
      <StyledGroupTitle>{t`Page style`}</StyledGroupTitle>
      {CAMPAIGN_PAGE_THEME_FIELDS.map(renderThemeField)}

      <StyledGroupTitle>{t`Body`}</StyledGroupTitle>
      {CAMPAIGN_BODY_THEME_FIELDS.map(renderThemeField)}
    </StyledContainer>
  );
};
