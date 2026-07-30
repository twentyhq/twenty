import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { campaignBodyEditorState } from '@/activities/emails/states/campaignBodyEditorState';
import { getEmailBlockSelectionTarget } from '@/advanced-text-editor/utils/getEmailBlockSelectionTarget';
import { parseInlineStyle } from '@/advanced-text-editor/utils/parseInlineStyle';
import { serializeInlineStyle } from '@/advanced-text-editor/utils/serializeInlineStyle';
import { CampaignBlockSettingsFieldInput } from '@/side-panel/pages/campaign-block-settings/components/CampaignBlockSettingsFieldInput';
import { CampaignPageStyleSection } from '@/side-panel/pages/campaign-block-settings/components/CampaignPageStyleSection';
import { CAMPAIGN_BLOCK_SETTINGS_FIELDS } from '@/side-panel/pages/campaign-block-settings/constants/CampaignBlockSettingsFields';
import { getCampaignBlockLabel } from '@/side-panel/pages/campaign-block-settings/utils/getCampaignBlockLabel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledBlockTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const BORDER_STYLE_COMPANIONS: Record<string, string> = {
  'border-width': 'border-style',
  'border-top-width': 'border-top-style',
};

const CampaignBlockSettingsContent = ({ editor }: { editor: Editor }) => {
  const target = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      getEmailBlockSelectionTarget(currentEditor),
  });

  // With no block selected, the panel edits the page itself, like Resend's
  // "Page style" default state.
  if (!isDefined(target)) {
    return <CampaignPageStyleSection editor={editor} />;
  }

  const fields = CAMPAIGN_BLOCK_SETTINGS_FIELDS[target.nodeType] ?? [];
  const styles = parseInlineStyle(target.attrs.style as string | undefined);

  const updateTargetAttributes = (attrs: Record<string, unknown>) => {
    editor
      .chain()
      .command(({ tr }) => {
        const node = tr.doc.nodeAt(target.pos);
        if (!isDefined(node)) {
          return false;
        }

        tr.setNodeMarkup(target.pos, undefined, { ...node.attrs, ...attrs });
        return true;
      })
      .run();
  };

  const handleFieldChange = (field: (typeof fields)[number], value: string) => {
    if (field.kind === 'attribute') {
      updateTargetAttributes({ [field.property]: value });
      return;
    }

    const nextStyles = { ...styles };
    if (value.trim() === '') {
      delete nextStyles[field.property];
    } else {
      nextStyles[field.property] = value;
    }

    // A border width without a border style renders no border at all.
    const borderStyleProperty = BORDER_STYLE_COMPANIONS[field.property];
    if (isDefined(borderStyleProperty)) {
      if (value.trim() === '' || value.trim() === '0px') {
        delete nextStyles[borderStyleProperty];
      } else {
        nextStyles[borderStyleProperty] ??= 'solid';
      }
    }

    updateTargetAttributes({ style: serializeInlineStyle(nextStyles) });
  };

  return (
    <StyledContainer>
      <StyledBlockTitle>
        {getCampaignBlockLabel(target.nodeType)}
      </StyledBlockTitle>
      {fields.map((field) => (
        <CampaignBlockSettingsFieldInput
          key={`${target.nodeType}-${target.pos}-${field.property}`}
          field={field}
          value={
            field.kind === 'attribute'
              ? ((target.attrs[field.property] as string | undefined) ?? '')
              : (styles[field.property] ?? '')
          }
          onChange={(value) => handleFieldChange(field, value)}
        />
      ))}
    </StyledContainer>
  );
};

export const SidePanelCampaignBlockSettingsPage = () => {
  const { t } = useLingui();
  const campaignBodyEditor = useAtomStateValue(campaignBodyEditorState);

  if (!isDefined(campaignBodyEditor) || campaignBodyEditor.isDestroyed) {
    return (
      <StyledHint>
        {t`Open a draft campaign composer to edit block settings.`}
      </StyledHint>
    );
  }

  return <CampaignBlockSettingsContent editor={campaignBodyEditor} />;
};
