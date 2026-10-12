import {
  type EmptyBlockHintTarget,
  getEmptyBlockHint,
} from '@/advanced-text-editor/utils/getEmptyBlockHint';
import { t } from '@lingui/core/macro';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { isDefined } from 'twenty-shared/utils';

const getEmptyBlockHintText = ({
  kind,
  headingLevel,
}: EmptyBlockHintTarget) => {
  switch (kind) {
    case 'heading':
      return headingLevel === 3
        ? t`Heading 3`
        : headingLevel === 2
          ? t`Heading 2`
          : t`Heading 1`;
    case 'listItem':
      return t`List`;
    case 'blockquote':
      return t`Quote`;
    case 'text':
      return t`Type anything or press / for commands`;
  }
};

export const EmptyBlockHint = Extension.create({
  name: 'emptyBlockHint',

  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      new Plugin({
        key: new PluginKey('emptyBlockHint'),
        props: {
          decorations: (state) => {
            const emptyBlockHint = getEmptyBlockHint(editor, state);

            if (!isDefined(emptyBlockHint)) {
              return DecorationSet.empty;
            }

            return DecorationSet.create(state.doc, [
              Decoration.node(emptyBlockHint.from, emptyBlockHint.to, {
                class: 'empty-block-hint',
                'data-hint': getEmptyBlockHintText(emptyBlockHint),
              }),
            ]);
          },
        },
      }),
    ];
  },
});
