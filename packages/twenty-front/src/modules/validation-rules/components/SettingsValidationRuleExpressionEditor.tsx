import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type JSONContent } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Placeholder } from '@tiptap/extensions/placeholder';
import { UndoRedo } from '@tiptap/extensions/undo-redo';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import { useState } from 'react';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  isDefined,
} from 'twenty-shared/utils';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/ui/input/constants/FormFieldPlaceholderStyles';
import { SettingsValidationRuleHelperPanel } from '@/validation-rules/components/SettingsValidationRuleHelperPanel';
import { VALIDATION_RULE_HIGHLIGHT_COLORS } from '@/validation-rules/constants/ValidationRuleHighlightColors';
import { ValidationRuleExpressionExtension } from '@/validation-rules/extensions/ValidationRuleExpressionExtension';
import { ValidationRuleFieldNode } from '@/validation-rules/extensions/ValidationRuleFieldNode';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { type ValidationRuleFieldNodeAttributes } from '@/validation-rules/types/ValidationRuleFieldNodeAttributes';
import { type ValidationRuleHelperContext } from '@/validation-rules/types/ValidationRuleHelperContext';
import { type ValidationRuleHelperItem } from '@/validation-rules/types/ValidationRuleHelperItem';
import { buildValidationRuleEditorParagraphContent } from '@/validation-rules/utils/buildValidationRuleEditorParagraphContent';
import { computeValidationRuleEditorSegments } from '@/validation-rules/utils/computeValidationRuleEditorSegments';
import { computeValidationRuleHelperContext } from '@/validation-rules/utils/computeValidationRuleHelperContext';
import { computeValidationRuleHelperContextAtCursor } from '@/validation-rules/utils/computeValidationRuleHelperContextAtCursor';
import { getValidationRuleEditorFieldChipLabel } from '@/validation-rules/utils/getValidationRuleEditorFieldChipLabel';
import { getValidationRuleEditorText } from '@/validation-rules/utils/getValidationRuleEditorText';
import { handleValidationRuleEditorPaste } from '@/validation-rules/utils/handleValidationRuleEditorPaste';
import { insertValidationRuleHelperItem } from '@/validation-rules/utils/insertValidationRuleHelperItem';

const SingleParagraphDocument = Document.extend({ content: 'paragraph' });

const StyledEditorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledEditor = styled.div<{ hasError: boolean }>`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid
    ${({ hasError }) =>
      hasError
        ? themeCssVariables.border.color.danger
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family};
  font-size: ${themeCssVariables.font.size.md};

  &:focus-within {
    border-color: ${themeCssVariables.color.blue};
  }

  .tiptap {
    line-height: 24px;
    min-height: 56px;
    outline: none;
    padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
    white-space: pre-wrap;
    word-break: break-word;

    p {
      margin: 0;
    }

    p.is-editor-empty:first-of-type::before {
      ${FORM_FIELD_PLACEHOLDER_STYLES}
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
  }

  .validation-rule-token-string {
    color: ${VALIDATION_RULE_HIGHLIGHT_COLORS.string};
  }

  .validation-rule-token-number {
    color: ${VALIDATION_RULE_HIGHLIGHT_COLORS.number};
  }

  .validation-rule-token-function {
    color: ${VALIDATION_RULE_HIGHLIGHT_COLORS.function};
  }

  .validation-rule-token-keyword {
    color: ${VALIDATION_RULE_HIGHLIGHT_COLORS.keyword};
  }

  .validation-rule-token-operator {
    color: ${VALIDATION_RULE_HIGHLIGHT_COLORS.operator};
  }
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

type SettingsValidationRuleExpressionEditorProps = {
  value: string;
  fields: ValidationRuleFieldDescriptor[];
  editorFields: ValidationRuleEditorField[];
  onChange: (expression: string) => void;
};

export const SettingsValidationRuleExpressionEditor = ({
  value,
  fields,
  editorFields,
  onChange,
}: SettingsValidationRuleExpressionEditorProps) => {
  const { t } = useLingui();

  const [helperContext, setHelperContext] =
    useState<ValidationRuleHelperContext>(() =>
      computeValidationRuleHelperContext({
        textBeforeCursor: '',
        isCursorAfterField: false,
        fields: editorFields,
      }),
    );
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [hasNavigatedHelper, setHasNavigatedHelper] = useState(false);

  const getFieldNodeAttributes = (
    path: string,
  ): ValidationRuleFieldNodeAttributes | null => {
    const field = editorFields.find((candidate) => candidate.path === path);

    return isDefined(field)
      ? {
          path,
          label: getValidationRuleEditorFieldChipLabel(field),
          iconName: field.iconName,
        }
      : null;
  };

  const refreshHelperContext = (editor: Editor) => {
    setHelperContext(
      computeValidationRuleHelperContextAtCursor({
        editor,
        fields: editorFields,
      }),
    );
    setHighlightedIndex(0);
    setHasNavigatedHelper(false);
  };

  const initialContent: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: buildValidationRuleEditorParagraphContent({
          segments: computeValidationRuleEditorSegments({
            expression: value,
            isFieldPath: (path) => isDefined(getFieldNodeAttributes(path)),
            cursorOffset: null,
            fieldRanges: [],
          }),
          getFieldNodeAttributes,
        }),
      },
    ],
  };

  const editor = useEditor({
    extensions: [
      SingleParagraphDocument,
      Paragraph,
      Text,
      UndoRedo,
      Placeholder.configure({
        placeholder: t`Type a field name or a function`,
      }),
      ValidationRuleFieldNode,
      ValidationRuleExpressionExtension.configure({ getFieldNodeAttributes }),
    ],
    content: initialContent,
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(getValidationRuleEditorText(updatedEditor.state.doc));
      refreshHelperContext(updatedEditor);
    },
    onSelectionUpdate: ({ editor: updatedEditor }) =>
      refreshHelperContext(updatedEditor),
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-label': t`Condition`,
        spellcheck: 'false',
      },
      handleKeyDown: (_view, event) => handleEditorKeyDown(event),
      handlePaste: handleValidationRuleEditorPaste,
    },
    enableInputRules: false,
    enablePasteRules: false,
    injectCSS: false,
  });

  const insertHelperItem = (item: ValidationRuleHelperItem) => {
    if (!isDefined(editor)) {
      return;
    }

    insertValidationRuleHelperItem({
      editor,
      item,
      replaceFromOffset: computeValidationRuleHelperContextAtCursor({
        editor,
        fields: editorFields,
      }).replaceFromOffset,
      getFieldNodeAttributes,
    });
  };

  const handleEditorKeyDown = (event: KeyboardEvent): boolean => {
    const { items, replaceFromOffset } = helperContext;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (items.length === 0) {
        return false;
      }

      const step = event.key === 'ArrowDown' ? 1 : -1;

      setHighlightedIndex(
        (index) => (index + step + items.length) % items.length,
      );
      setHasNavigatedHelper(true);

      return true;
    }

    if (event.key !== 'Enter') {
      return false;
    }

    const highlightedItem = items[highlightedIndex];
    const isWordBeingTyped =
      isDefined(editor) &&
      replaceFromOffset <
        getValidationRuleEditorText(
          editor.state.doc,
          editor.state.selection.from,
        ).length;

    if (
      isDefined(highlightedItem) &&
      (hasNavigatedHelper || isWordBeingTyped)
    ) {
      insertHelperItem(highlightedItem);
    }

    return true;
  };

  const compilationResult = compileValidationRuleExpression({
    expression: value,
    fields,
  });
  const errorMessage =
    value.trim().length > 0 && !compilationResult.isValid
      ? compilationResult.errorMessage
      : null;

  return (
    <>
      <Card.Content divider>
        <StyledEditorContent>
          <StyledEditor hasError={isDefined(errorMessage)}>
            <EditorContent editor={editor} />
          </StyledEditor>
          {isDefined(errorMessage) && (
            <StyledError role="alert">{errorMessage}</StyledError>
          )}
        </StyledEditorContent>
      </Card.Content>
      <SettingsValidationRuleHelperPanel
        items={helperContext.items}
        highlightedIndex={highlightedIndex}
        editorFields={editorFields}
        onHighlight={setHighlightedIndex}
        onSelect={insertHelperItem}
      />
    </>
  );
};
