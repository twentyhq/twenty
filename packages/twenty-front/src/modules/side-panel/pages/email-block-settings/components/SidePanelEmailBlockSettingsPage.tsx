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

import { activeEmailEditorState } from '@/advanced-text-editor/states/activeEmailEditorState';
import { getBlockSelectionTarget } from '@/advanced-text-editor/utils/getBlockSelectionTarget';
import { getBlockStyle } from '@/advanced-text-editor/utils/getBlockStyle';
import { EmailBlockSettingsFieldInput } from '@/side-panel/pages/email-block-settings/components/EmailBlockSettingsFieldInput';
import {
  EmailBoxSidesInput,
  type CssBoxSides,
} from '@/side-panel/pages/email-block-settings/components/EmailBoxSidesInput';
import { EmailPageStyleSection } from '@/side-panel/pages/email-block-settings/components/EmailPageStyleSection';
import { EMAIL_BLOCK_SETTINGS_FIELDS } from '@/side-panel/pages/email-block-settings/constants/EmailBlockSettingsFields';
import { getEmailBlockLabel } from '@/side-panel/pages/email-block-settings/utils/getEmailBlockLabel';
import { getEffectiveSectionStyleValue } from '@/side-panel/pages/email-block-settings/utils/getEffectiveSectionStyleValue';
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

const EmailBlockSettingsContent = ({ editor }: { editor: Editor }) => {
  const { i18n, t } = useLingui();
  const target = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      getBlockSelectionTarget(currentEditor),
  });

  if (!isDefined(target)) {
    return <EmailPageStyleSection editor={editor} />;
  }

  const fields = EMAIL_BLOCK_SETTINGS_FIELDS[target.nodeType] ?? [];
  const styles = getBlockStyle(target.attrs.style);
  const canvasTheme = resolveCanvasTheme(editor.state.doc.attrs.canvasTheme);

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
      if (field.property === 'width') {
        const trimmed = value.trim();
        if (trimmed === '' || trimmed === 'auto') {
          updateTargetAttributes({ width: null });
        } else if (Number.isFinite(Number(trimmed)) && Number(trimmed) >= 0) {
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
          {getEmailBlockLabel(target.nodeType)}
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
            <EmailBoxSidesInput
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
          <EmailBlockSettingsFieldInput
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

export const SidePanelEmailBlockSettingsPage = () => {
  const { t } = useLingui();
  const activeEmailEditor = useAtomStateValue(activeEmailEditorState);

  if (!isDefined(activeEmailEditor) || activeEmailEditor.isDestroyed) {
    return (
      <StyledHint>{t`Open an email editor to edit block settings.`}</StyledHint>
    );
  }

  return <EmailBlockSettingsContent editor={activeEmailEditor} />;
};
