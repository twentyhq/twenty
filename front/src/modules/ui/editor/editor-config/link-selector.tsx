/* eslint twenty/no-hardcoded-colors: 0 */

import { Dispatch, FC, SetStateAction, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { Editor } from '@tiptap/core';

import { IconCheck, IconLink, IconTrash } from '@/ui/icon/index';

const RelativeDiv = styled.div`
  position: relative;
`;

const StyledButton = styled.button`
  background-color: inherit;
  display: flex;
  align-items: center;
  height: 100%;
  &:hover {
    background-color: #f7fafc; // replace with actual color
  }
  &:active {
    background-color: #edf2f7; // replace with actual color
  }
`;

const StyledLink = styled.div<{ active?: boolean }>`
  text-decoration: underline;
  text-decoration-color: #edf2f7; // replace with actual color
  text-decoration-thickness: 4px;
  color: ${(props) =>
    props.active ? '#3182ce' : props.theme.font.color.primary};
}; // replace with actual colors
`;

const StyledForm = styled.form`
  position: fixed;
  top: 100%;
  z-index: 99999;
  margin-top: 0.25rem;
  display: flex;
  width: 15rem;
  overflow: hidden;
  border-radius: 0.25rem;
  border: 1px solid #edf2f7; // replace with actual color
  background-color: #ffffff;
  padding: 0.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  // Add your animations here
`;

const StyledInput = styled.input`
  background-color: #ffffff;
  flex: 1;
  font-size: 0.875rem;
  outline: none;
  padding: 0.25rem;
`;

const StyledTrashButton = styled.button`
  display: flex;
  align-items: center;
  border-radius: 0.125rem;
  padding: 0.25rem;
  color: #e53e3e; // replace with actual color
  transition: all 0.2s;
  &:hover {
    background-color: #f7fafc; // replace with actual color
  }
`;

const StyledCheckButton = styled.button`
  display: flex;
  align-items: center;
  border-radius: 0.125rem;
  padding: 0.25rem;
  color: #4a5568; // replace with actual color
  transition: all 0.2s;
  &:hover {
    background-color: #f7fafc; // replace with actual color
  }
`;

interface LinkSelectorProps {
  editor: Editor;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const LinkSelector: FC<LinkSelectorProps> = ({
  editor,
  isOpen,
  setIsOpen,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus on input by default
  useEffect(() => {
    inputRef.current && inputRef.current?.focus();
  });

  return (
    <RelativeDiv>
      <StyledButton onClick={() => setIsOpen(!isOpen)}>
        <StyledLink active={editor.isActive('link')}>
          <IconLink />
        </StyledLink>
      </StyledButton>

      {isOpen && (
        <StyledForm
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const input = form.elements[0] as HTMLInputElement;
            editor.chain().focus().setLink({ href: input.value }).run();
            setIsOpen(false);
          }}
        >
          <StyledInput
            ref={inputRef}
            type="url"
            placeholder="Paste a link"
            defaultValue={editor.getAttributes('link').href || ''}
          />
          {editor.getAttributes('link').href ? (
            <StyledTrashButton
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setIsOpen(false);
              }}
            >
              <IconTrash className="h-4 w-4" />
            </StyledTrashButton>
          ) : (
            <StyledCheckButton>
              <IconCheck className="h-4 w-4" />
            </StyledCheckButton>
          )}
        </StyledForm>
      )}
    </RelativeDiv>
  );
};
