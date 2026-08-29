import { type Editor } from '@tiptap/react';
import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AiChatEditorFocusEffect } from '@/ai/components/internal/AiChatEditorFocusEffect';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const focus = jest.fn();

// Tiptap throws from the commands getter once the view is gone, which is what
// made a destroyed editor crash the chat page.
const getEditorMock = ({ isDestroyed }: { isDestroyed: boolean }) =>
  ({
    isDestroyed,
    get commands() {
      if (isDestroyed) {
        throw new TypeError("Cannot read properties of null (reading 'state')");
      }

      return { focus };
    },
  }) as unknown as Editor;

describe('AiChatEditorFocusEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(shouldFocusChatEditorState.atom, true);
  });

  it('should focus a live editor and consume the request', () => {
    render(
      <AiChatEditorFocusEffect
        editor={getEditorMock({ isDestroyed: false })}
      />,
      { wrapper: Wrapper },
    );

    expect(focus).toHaveBeenCalledWith('end');
    expect(jotaiStore.get(shouldFocusChatEditorState.atom)).toBe(false);
  });

  it('should leave the request for the next editor when the current one is destroyed', () => {
    expect(() =>
      render(
        <AiChatEditorFocusEffect
          editor={getEditorMock({ isDestroyed: true })}
        />,
        { wrapper: Wrapper },
      ),
    ).not.toThrow();

    expect(focus).not.toHaveBeenCalled();
    expect(jotaiStore.get(shouldFocusChatEditorState.atom)).toBe(true);
  });

  it('should keep the request while no editor is mounted', () => {
    render(<AiChatEditorFocusEffect editor={null} />, { wrapper: Wrapper });

    expect(focus).not.toHaveBeenCalled();
    expect(jotaiStore.get(shouldFocusChatEditorState.atom)).toBe(true);
  });
});
