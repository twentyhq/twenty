/* eslint twenty/no-hardcoded-colors: 0 */
// Code for this editor was inspired from
// https://github.com/steven-tey/novel

import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { EditorContent, useEditor } from '@tiptap/react';
import { useCompletion } from 'ai/react';

import { debounce } from '~/utils/debounce';

import { TiptapExtensions } from '../editor-config/extensions';
import { TiptapEditorProps } from '../editor-config/props';
import { getPrevText } from '../editor-config/utils';

import { EditorBubbleMenu } from './EditorBubbleMenu';

const StyledEditorContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};

  .ProseMirror:focus {
    outline: none;
  }

  .ProseMirror .is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: var(--novel-stone-400);
    pointer-events: none;
    height: 0;
  }
  .ProseMirror .is-empty::before {
    content: attr(data-placeholder);
    float: left;
    color: var(--novel-stone-400);
    pointer-events: none;
    height: 0;
  }

  /* Custom image styles */

  .ProseMirror img {
    transition: filter 0.1s ease-in-out;

    &:hover {
      cursor: pointer;
      filter: brightness(90%);
    }

    &.ProseMirror-selectednode {
      outline: 3px solid #5abbf7;
      filter: brightness(90%);
    }
  }

  .img-placeholder {
    position: relative;

    &:before {
      content: '';
      box-sizing: border-box;
      position: absolute;
      top: 50%;
      left: 50%;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid var(--novel-stone-200);
      border-top-color: var(--novel-stone-800);
      animation: spinning 0.6s linear infinite;
    }
  }

  @keyframes spinning {
    to {
      transform: rotate(360deg);
    }
  }

  /* Custom TODO list checkboxes – shoutout to this awesome tutorial: https://moderncss.dev/pure-css-custom-checkbox-style/ */

  ul[data-type='taskList'] li > label {
    margin-right: 0.2rem;
    user-select: none;
  }

  @media screen and (max-width: 768px) {
    ul[data-type='taskList'] li > label {
      margin-right: 0.5rem;
    }
  }

  ul[data-type='taskList'] li > label input[type='checkbox'] {
    -webkit-appearance: none;
    appearance: none;
    background-color: var(--novel-white);
    margin: 0;
    cursor: pointer;
    width: 1.2em;
    height: 1.2em;
    position: relative;
    top: 5px;
    border: 2px solid var(--novel-stone-900);
    margin-right: 0.3rem;
    display: grid;
    place-content: center;

    &:hover {
      background-color: var(--novel-stone-50);
    }

    &:active {
      background-color: var(--novel-stone-200);
    }

    &::before {
      content: '';
      width: 0.65em;
      height: 0.65em;
      transform: scale(0);
      transition: 120ms transform ease-in-out;
      box-shadow: inset 1em 1em;
      transform-origin: center;
      clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
    }

    &:checked::before {
      transform: scale(1);
    }
  }

  ul[data-type='taskList'] li[data-checked='true'] > div > p {
    color: var(--novel-stone-400);
    text-decoration: line-through;
    text-decoration-thickness: 2px;
  }

  /* Overwrite tippy-box original max-width */

  .tippy-box {
    max-width: 400px !important;
  }
`;

export function Editor() {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('Saved');

  const [hydrated, setHydrated] = useState(false);

  const debouncedUpdates = debounce(async ({ editor }) => {
    const json = editor.getJSON();
    setSaveStatus('Saving...');
    setContent(json);
    // Simulate a delay in saving.
    setTimeout(() => {
      setSaveStatus('Saved');
    }, 500);
  }, 750);

  const editor = useEditor({
    extensions: TiptapExtensions,
    editorProps: TiptapEditorProps,
    onUpdate: (e) => {
      setSaveStatus('Unsaved');
      const selection = e.editor.state.selection;
      const lastTwo = getPrevText(e.editor, {
        chars: 2,
      });
      if (lastTwo === '++' && !isLoading) {
        e.editor.commands.deleteRange({
          from: selection.from - 2,
          to: selection.from,
        });
        complete(
          getPrevText(e.editor, {
            chars: 5000,
          }),
        );
        // complete(e.editor.storage.markdown.getMarkdown());
      } else {
        debouncedUpdates(e);
      }
    },
    autofocus: 'end',
  });

  const { complete, completion, isLoading, stop } = useCompletion({
    id: 'novel',
    api: 'https://novel.sh/api/generate',
    onFinish: (_prompt, completion) => {
      editor?.commands.setTextSelection({
        from: editor.state.selection.from - completion.length,
        to: editor.state.selection.from,
      });
    },
    onError: (err) => {
      // toast.error(err.message);
    },
  });

  const prev = useRef('');

  // Insert chunks of the generated text
  useEffect(() => {
    const diff = completion.slice(prev.current.length);
    prev.current = completion;
    editor?.commands.insertContent(diff);
  }, [isLoading, editor, completion]);

  useEffect(() => {
    // if user presses escape or cmd + z and it's loading,
    // stop the request, delete the completion, and insert back the "++"
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.metaKey && e.key === 'z')) {
        stop();
        if (e.key === 'Escape') {
          editor?.commands.deleteRange({
            from: editor.state.selection.from - completion.length,
            to: editor.state.selection.from,
          });
        }
        editor?.commands.insertContent('++');
      }
    };
    const mousedownHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      stop();
      if (window.confirm('AI writing paused. Continue?')) {
        complete(editor?.getText() || '');
      }
    };
    if (isLoading) {
      document.addEventListener('keydown', onKeyDown);
      window.addEventListener('mousedown', mousedownHandler);
    } else {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', mousedownHandler);
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', mousedownHandler);
    };
  }, [stop, isLoading, editor, complete, completion.length]);

  // Hydrate the editor with the content from localStorage.
  useEffect(() => {
    if (editor && content && !hydrated) {
      editor.commands.setContent(content);
      setHydrated(true);
    }
  }, [editor, content, hydrated]);

  return (
    <StyledEditorContainer>
      {saveStatus}
      {editor && <EditorBubbleMenu editor={editor} />}
      <EditorContent editor={editor} />
    </StyledEditorContainer>
  );
}
