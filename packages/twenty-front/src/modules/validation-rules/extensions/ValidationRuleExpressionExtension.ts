import { Extension } from '@tiptap/core';
import { Fragment } from '@tiptap/pm/model';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { isDefined } from 'twenty-shared/utils';

import { VALIDATION_RULE_HIGHLIGHT_CLASS_NAME_PREFIX } from '@/validation-rules/constants/ValidationRuleHighlightClassNamePrefix';
import { type ValidationRuleEditorSegment } from '@/validation-rules/types/ValidationRuleEditorSegment';
import { type ValidationRuleFieldNodeAttributes } from '@/validation-rules/types/ValidationRuleFieldNodeAttributes';
import { buildValidationRuleEditorParagraphContent } from '@/validation-rules/utils/buildValidationRuleEditorParagraphContent';
import { computeValidationRuleEditorSegments } from '@/validation-rules/utils/computeValidationRuleEditorSegments';
import { computeValidationRuleExpressionHighlights } from '@/validation-rules/utils/computeValidationRuleExpressionHighlights';
import { getValidationRuleEditorPositionFromTextOffset } from '@/validation-rules/utils/getValidationRuleEditorPositionFromTextOffset';
import { getValidationRuleEditorText } from '@/validation-rules/utils/getValidationRuleEditorText';
import { readValidationRuleEditorSegments } from '@/validation-rules/utils/readValidationRuleEditorSegments';

type ValidationRuleExpressionExtensionOptions = {
  getFieldNodeAttributes: (
    path: string,
  ) => ValidationRuleFieldNodeAttributes | null;
};

const PARAGRAPH_CONTENT_START_POSITION = 1;

const areSegmentsEqual = (
  left: ValidationRuleEditorSegment[],
  right: ValidationRuleEditorSegment[],
) => JSON.stringify(left) === JSON.stringify(right);

export const ValidationRuleExpressionExtension =
  Extension.create<ValidationRuleExpressionExtensionOptions>({
    name: 'validationRuleExpression',

    addOptions: () => ({
      getFieldNodeAttributes: () => null,
    }),

    addProseMirrorPlugins() {
      const { getFieldNodeAttributes } = this.options;

      return [
        new Plugin({
          key: new PluginKey('validationRuleExpression'),

          appendTransaction: (transactions, _oldState, newState) => {
            if (
              !transactions.some(
                (transaction) =>
                  transaction.docChanged || transaction.selectionSet,
              )
            ) {
              return null;
            }

            const { doc, selection, schema } = newState;
            const paragraph = doc.firstChild;

            if (!isDefined(paragraph)) {
              return null;
            }

            const cursorOffset = selection.empty
              ? getValidationRuleEditorText(doc, selection.from).length
              : null;
            const { segments, fieldRanges } =
              readValidationRuleEditorSegments(doc);

            const normalizedSegments = computeValidationRuleEditorSegments({
              expression: getValidationRuleEditorText(doc),
              isFieldPath: (path) => isDefined(getFieldNodeAttributes(path)),
              cursorOffset,
              fieldRanges,
            });

            if (areSegmentsEqual(segments, normalizedSegments)) {
              return null;
            }

            const transaction = newState.tr.replaceWith(
              PARAGRAPH_CONTENT_START_POSITION,
              PARAGRAPH_CONTENT_START_POSITION + paragraph.content.size,
              Fragment.fromJSON(
                schema,
                buildValidationRuleEditorParagraphContent({
                  segments: normalizedSegments,
                  getFieldNodeAttributes,
                }),
              ),
            );

            if (isDefined(cursorOffset)) {
              transaction.setSelection(
                TextSelection.create(
                  transaction.doc,
                  getValidationRuleEditorPositionFromTextOffset(
                    transaction.doc,
                    cursorOffset,
                  ),
                ),
              );
            }

            return transaction;
          },

          props: {
            decorations: ({ doc }) =>
              DecorationSet.create(
                doc,
                computeValidationRuleExpressionHighlights(
                  getValidationRuleEditorText(doc),
                ).flatMap(({ kind, start, end }) => {
                  const from = getValidationRuleEditorPositionFromTextOffset(
                    doc,
                    start,
                  );
                  const to = getValidationRuleEditorPositionFromTextOffset(
                    doc,
                    end,
                  );

                  return from < to
                    ? [
                        Decoration.inline(from, to, {
                          class: `${VALIDATION_RULE_HIGHLIGHT_CLASS_NAME_PREFIX}${kind}`,
                        }),
                      ]
                    : [];
                }),
              ),
          },
        }),
      ];
    },
  });
