import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import {
  isDefined,
  resolveCanvasTheme,
  TIPTAP_NODE_TYPES,
} from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { campaignBodyEditorState } from '@/activities/emails/states/campaignBodyEditorState';
import { getBlockSelectionTarget } from '@/advanced-text-editor/utils/getBlockSelectionTarget';
import { getBlockStyle } from '@/advanced-text-editor/utils/getBlockStyle';
import { CampaignBlockSettingsFieldInput } from '@/side-panel/pages/campaign-block-settings/components/CampaignBlockSettingsFieldInput';
import {
  CampaignBoxSidesInput,
  type CssBoxSides,
} from '@/side-panel/pages/campaign-block-settings/components/CampaignBoxSidesInput';
import { CampaignPageStyleSection } from '@/side-panel/pages/campaign-block-settings/components/CampaignPageStyleSection';
import { CAMPAIGN_BLOCK_SETTINGS_FIELDS } from '@/side-panel/pages/campaign-block-settings/constants/CampaignBlockSettingsFields';
import { getCampaignBlockLabel } from '@/side-panel/pages/campaign-block-settings/utils/getCampaignBlockLabel';
import { getEffectiveSectionStyleValue } from '@/side-panel/pages/campaign-block-settings/utils/getEffectiveSectionStyleValue';
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

const StyledBlockHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledBlockTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const BORDER_STYLE_COMPANIONS: Record<string, string> = {
  borderWidth: 'borderStyle',
  borderTopWidth: 'borderTopStyle',
};

// Box fields group the four longhand properties one control edits together.
const BOX_FIELD_SIDE_PROPERTIES: Record<
  string,
  [string, string, string, string]
> = {
  padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
  borderRadius: [
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomRightRadius',
    'borderBottomLeftRadius',
  ],
};

const CampaignBlockSettingsContent = ({ editor }: { editor: Editor }) => {
  const { i18n, t } = useLingui();
  const target = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      getBlockSelectionTarget(currentEditor),
  });

  // With no block selected, the panel edits the page itself, like Resend's
  // "Page style" default state.
  if (!isDefined(target)) {
    return <CampaignPageStyleSection editor={editor} />;
  }

  const fields = CAMPAIGN_BLOCK_SETTINGS_FIELDS[target.nodeType] ?? [];
  const styles = getBlockStyle(target.attrs.style);
  const canvasTheme = resolveCanvasTheme(editor.state.doc.attrs.canvasTheme);

  // A section inherits from the body until it overrides, so show what is
  // actually in effect instead of an empty field. Values are only written
  // when edited, which keeps the section inheriting.
  const displayedStyleValue = (property: string) =>
    styles[property] ??
    (target.nodeType === TIPTAP_NODE_TYPES.SECTION
      ? getEffectiveSectionStyleValue(property, canvasTheme)
      : '');

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

  // The floating image menu does not mount on this surface, so removing a
  // block has to be reachable from the panel.
  const handleRemoveBlock = () => {
    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        const node = tr.doc.nodeAt(target.pos);
        if (!isDefined(node)) {
          return false;
        }

        tr.delete(target.pos, target.pos + node.nodeSize);
        return true;
      })
      .run();
  };

  const handleFieldChange = (field: (typeof fields)[number], value: string) => {
    if (field.kind === 'attribute') {
      // The image width attribute is numeric (the resize handle writes
      // pixel numbers); everything else is a plain string.
      if (field.property === 'width') {
        const trimmed = value.trim();
        if (trimmed === '') {
          updateTargetAttributes({ width: null });
        } else if (!Number.isNaN(Number(trimmed))) {
          updateTargetAttributes({ width: Number(trimmed) });
        }
        return;
      }

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

    updateTargetAttributes({ style: nextStyles });
  };

  const handleBoxFieldChange = (
    sideProperties: [string, string, string, string],
    sides: CssBoxSides,
  ) => {
    const nextStyles = { ...styles };
    const sideValues = [sides.top, sides.right, sides.bottom, sides.left];

    sideProperties.forEach((property, index) => {
      if (sideValues[index].trim() === '') {
        delete nextStyles[property];
      } else {
        nextStyles[property] = sideValues[index];
      }
    });

    updateTargetAttributes({ style: nextStyles });
  };

  return (
    <StyledContainer>
      <StyledBlockHeader>
        <StyledBlockTitle>
          {getCampaignBlockLabel(target.nodeType)}
        </StyledBlockTitle>
        <LightIconButton
          Icon={IconTrash}
          size="small"
          accent="tertiary"
          title={t`Remove block`}
          onClick={handleRemoveBlock}
        />
      </StyledBlockHeader>
      {fields.map((field) => {
        const key = `${target.nodeType}-${target.pos}-${field.property}`;
        const sideProperties = BOX_FIELD_SIDE_PROPERTIES[field.property];

        if (
          field.kind === 'style' &&
          field.input === 'box' &&
          isDefined(sideProperties)
        ) {
          return (
            <CampaignBoxSidesInput
              key={key}
              label={i18n._(field.label)}
              sides={{
                top: displayedStyleValue(sideProperties[0]),
                right: displayedStyleValue(sideProperties[1]),
                bottom: displayedStyleValue(sideProperties[2]),
                left: displayedStyleValue(sideProperties[3]),
              }}
              onChange={(sides) => handleBoxFieldChange(sideProperties, sides)}
              placeholder={field.placeholder}
            />
          );
        }

        return (
          <CampaignBlockSettingsFieldInput
            key={key}
            field={field}
            value={
              field.kind === 'attribute'
                ? String(target.attrs[field.property] ?? '')
                : displayedStyleValue(field.property)
            }
            onChange={(value) => handleFieldChange(field, value)}
          />
        );
      })}
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
