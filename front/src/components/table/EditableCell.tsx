import styled from '@emotion/styled';
import * as React from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';

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

  :hover::before {
    display: block;
  }

  [contenteditable] {
    outline: none;
  }
`;

const Container = styled.span`
  padding-left: ${(props) => props.theme.spacing(2)};
`;

function escapeHTML(unsafeText: string): string {
  const div = document.createElement('div');
  div.innerText = unsafeText;
  return div.innerHTML;
}

function EditableCell({ content, changeHandler }: OwnProps) {
  const ref = React.createRef<HTMLElement>();

  return (
    <StyledEditable>
      <Container>
        <ContentEditable
          innerRef={ref}
          html={escapeHTML(content)}
          disabled={false}
          onChange={(e: ContentEditableEvent) => changeHandler(e.target.value)}
          tagName="span"
        />
      </Container>
    </StyledEditable>
  );
}

export default EditableCell;
