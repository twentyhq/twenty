import { type ChainedCommands, type Editor } from '@tiptap/core';

type EditLinkCommandChain = {
  [CommandName in 'focus' | 'extendMarkRange' | 'setLink' | 'unsetLink']: (
    ...args: Parameters<ChainedCommands[CommandName]>
  ) => EditLinkCommandChain;
} & Pick<ChainedCommands, 'run'>;

export type EditLinkEditor = {
  chain: () => EditLinkCommandChain;
  view: Pick<Editor['view'], 'dom'>;
};
