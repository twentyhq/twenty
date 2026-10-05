import { type Editor } from '@tiptap/core';

import { VALIDATION_RULE_FIELD_NODE_NAME } from '@/validation-rules/constants/ValidationRuleFieldNodeName';
import { type ValidationRuleFieldNodeAttributes } from '@/validation-rules/types/ValidationRuleFieldNodeAttributes';
import { type ValidationRuleHelperItem } from '@/validation-rules/types/ValidationRuleHelperItem';
import { getValidationRuleEditorPositionFromTextOffset } from '@/validation-rules/utils/getValidationRuleEditorPositionFromTextOffset';

export const insertValidationRuleHelperItem = ({
  editor,
  item,
  replaceFromOffset,
  getFieldNodeAttributes,
}: {
  editor: Editor;
  item: ValidationRuleHelperItem;
  replaceFromOffset: number;
  getFieldNodeAttributes: (
    path: string,
  ) => ValidationRuleFieldNodeAttributes | null;
}) => {
  const from = getValidationRuleEditorPositionFromTextOffset(
    editor.state.doc,
    replaceFromOffset,
  );
  const range = { from, to: editor.state.selection.from };

  switch (item.kind) {
    case 'field':
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: VALIDATION_RULE_FIELD_NODE_NAME,
            attrs: getFieldNodeAttributes(item.field.path),
          },
        ])
        .run();
      return;
    case 'function':
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          { type: 'text', text: `${item.definition.name}()` },
        ])
        .setTextSelection(from + item.definition.name.length + 1)
        .run();
      return;
    case 'keyword':
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          { type: 'text', text: `${item.definition.name} ` },
        ])
        .run();
      return;
  }
};
