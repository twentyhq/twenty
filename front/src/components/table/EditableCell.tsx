import styled from '@emotion/styled';
import * as React from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { convert } from 'html-to-text';

type OwnProps = {
  content: string;
  changeHandler: (updated: string) => void;
};

const StyledEditable = styled.div`
  position: relative;
  box-sizing: border-box;
  height: 32px;
  display: flex;
  align-items: center;

  :hover::before {
    display: block;
  }

  ::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    border: 1px solid ${(props) => props.theme.text20};
    box-sizing: border-box;
    border-radius: 4px;
    pointer-events: none;
    display: none;
  }

  :focus-within {
    color: ${(props) => props.theme.text100};
  }

  :focus-within::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    border: 1px solid ${(props) => props.theme.blue};
    border-radius: 4px;
    pointer-events: none;
    display: block;
  }

  [contenteditable] {
    outline: none;
    white-space: nowrap;
    overflow: hidden;
  }

  [contenteditable] br {
    display: none;
  }

  [contenteditable] * {
    display: inline;
    white-space: nowrap;
  }
`;

const Container = styled.span`
  padding-left: ${(props) => props.theme.spacing(2)};
`;

function EditableCell({ content, changeHandler }: OwnProps) {
  const ref = React.createRef<HTMLElement>();

  return (
    <StyledEditable onClick={() => ref.current?.focus()}>
      <Container>
        <ContentEditable
          innerRef={ref}
          html={content}
          disabled={false}
          onChange={(e: ContentEditableEvent) =>
            changeHandler(convert(e.target.value))
          }
          tagName="span"
        />
      </Container>
    </StyledEditable>
  );
}

export default EditableCell;
