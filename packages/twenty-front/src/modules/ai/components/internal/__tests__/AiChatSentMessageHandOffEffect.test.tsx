import { render } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AiChatSentMessageHandOffEffect } from '@/ai/components/internal/AiChatSentMessageHandOffEffect';
import { agentChatSentMessageHandOffState } from '@/ai/states/agentChatSentMessageHandOffState';
import { dispatchAgentChatSendMessageEvent } from '@/ai/utils/dispatchAgentChatSendMessageEvent';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const PENDING_HAND_OFF = {
  composerTextRect: { left: 1, top: 2 },
  messageId: null,
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('AiChatSentMessageHandOffEffect', () => {
  let editor: Editor;

  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(agentChatSentMessageHandOffState.atom, PENDING_HAND_OFF);
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, Text],
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  it.each([
    {
      description:
        'keeps the pending hand-off when Enter is pressed again on the emptied composer',
      composerText: '',
      isComposerCentered: true,
      expectedHandOff: PENDING_HAND_OFF,
    },
    {
      description:
        'drops the pending hand-off when a message is sent from the bottom composer',
      composerText: 'Show my pipeline',
      isComposerCentered: false,
      expectedHandOff: null,
    },
  ])(
    '$description',
    ({ composerText, isComposerCentered, expectedHandOff }) => {
      editor.commands.setContent(composerText);

      render(
        <AiChatSentMessageHandOffEffect
          editor={editor}
          isComposerCentered={isComposerCentered}
        />,
        { wrapper: Wrapper },
      );

      dispatchAgentChatSendMessageEvent();

      expect(jotaiStore.get(agentChatSentMessageHandOffState.atom)).toEqual(
        expectedHandOff,
      );
    },
  );
});
