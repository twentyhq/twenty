import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import {
  type EmailTheme,
  isDefined,
  resolveEmailTheme,
} from 'twenty-shared/utils';
import { IconAlignCenter, IconAlignLeft, IconAlignRight } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CampaignBoxSidesInput } from '@/side-panel/pages/campaign-block-settings/components/CampaignBoxSidesInput';
import { CampaignColorInput } from '@/side-panel/pages/campaign-block-settings/components/CampaignColorInput';
import { CampaignSizeInput } from '@/side-panel/pages/campaign-block-settings/components/CampaignSizeInput';
import { StyledCampaignFieldLabel } from '@/side-panel/pages/campaign-block-settings/components/StyledCampaignFieldLabel';

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

const StyledAlignRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledAlignButton = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.transparent.medium : 'none'};
  border: 1px solid
    ${({ isActive }) =>
      isActive ? themeCssVariables.border.color.strong : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: center;
  padding: 0;
  width: 32px;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]};
`;

const BODY_ALIGN_OPTIONS = [
  { align: 'left', Icon: IconAlignLeft },
  { align: 'center', Icon: IconAlignCenter },
  { align: 'right', Icon: IconAlignRight },
] as const;

type CampaignPageStyleSectionProps = {
  editor: Editor;
};

// The panel's default state, mirroring Resend's "Page style": the page
// behind the email, then the email body itself.
export const CampaignPageStyleSection = ({
  editor,
}: CampaignPageStyleSectionProps) => {
  const { t } = useLingui();

  const emailTheme = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      resolveEmailTheme(currentEditor.state.doc.attrs.emailTheme),
  });

  if (!isDefined(emailTheme)) {
    return (
      <StyledHint>
        {t`Select a section, columns, button or divider in the email body to edit its settings.`}
      </StyledHint>
    );
  }

  const setThemeValue = (themeKey: keyof EmailTheme, value: string) => {
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
      <StyledGroupTitle>{t`Page style`}</StyledGroupTitle>
      <CampaignColorInput
        label={t`Background`}
        value={emailTheme.pageBackground}
        onChange={(value) => setThemeValue('pageBackground', value)}
      />
      <CampaignBoxSidesInput
        label={t`Padding`}
        value={emailTheme.pagePadding}
        onChange={(value) => setThemeValue('pagePadding', value)}
        placeholder="24"
      />

      <StyledGroupTitle>{t`Body`}</StyledGroupTitle>
      <div>
        <StyledCampaignFieldLabel>{t`Alignment`}</StyledCampaignFieldLabel>
        <StyledAlignRow>
          {BODY_ALIGN_OPTIONS.map(({ align, Icon }) => (
            <StyledAlignButton
              key={align}
              type="button"
              isActive={emailTheme.textAlign === align}
              onClick={() => setThemeValue('textAlign', align)}
            >
              <Icon size={16} />
            </StyledAlignButton>
          ))}
        </StyledAlignRow>
      </div>
      <CampaignColorInput
        label={t`Text`}
        value={emailTheme.textColor}
        onChange={(value) => setThemeValue('textColor', value)}
      />
      <CampaignColorInput
        label={t`Background`}
        value={emailTheme.bodyBackground}
        onChange={(value) => setThemeValue('bodyBackground', value)}
      />
      <CampaignSizeInput
        label={t`Width`}
        value={emailTheme.width}
        onChange={(value) => setThemeValue('width', value)}
        placeholder="600"
      />
      <CampaignBoxSidesInput
        label={t`Padding`}
        value={emailTheme.padding}
        onChange={(value) => setThemeValue('padding', value)}
        placeholder="24"
      />
      <CampaignBoxSidesInput
        label={t`Corner radius`}
        value={emailTheme.cornerRadius}
        onChange={(value) => setThemeValue('cornerRadius', value)}
        placeholder="8"
      />
      <CampaignSizeInput
        label={t`Border`}
        value={emailTheme.borderWidth}
        onChange={(value) => setThemeValue('borderWidth', value)}
        placeholder="0"
      />
      <CampaignColorInput
        label={t`Border color`}
        value={emailTheme.borderColor}
        onChange={(value) => setThemeValue('borderColor', value)}
      />
    </StyledContainer>
  );
};
