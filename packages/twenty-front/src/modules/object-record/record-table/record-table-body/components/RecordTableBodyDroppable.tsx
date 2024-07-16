import { Theme } from '@emotion/react';
import { Droppable } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { ReactNode, useContext, useState } from 'react';
import { ThemeContext } from 'twenty-ui';
import { v4 } from 'uuid';

const StyledTbody = styled.tbody<{
  theme: Theme;
}>`
  overflow: hidden;

  &.first-columns-sticky {
    td:nth-of-type(1) {
      position: sticky;
      left: 0;
      z-index: 5;
    }
    td:nth-of-type(2) {
      position: sticky;
      left: 9px;
      z-index: 5;
    }
    td:nth-of-type(3) {
      position: sticky;
      left: 39px;
      z-index: 5;
      &::after {
        content: '';
        position: absolute;
        top: -1px;
        height: calc(100% + 2px);
        width: 4px;
        right: 0px;
        box-shadow: ${({ theme }) => theme.boxShadow.light};
        clip-path: inset(0px -4px 0px 0px);
      }
    }
  }
`;

export const RecordTableBodyDroppable = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [v4Persistable] = useState(v4());

  const { theme } = useContext(ThemeContext);

  return (
    <Droppable droppableId={v4Persistable}>
      {(provided) => (
        <StyledTbody
          id="record-table-body"
          theme={theme}
          ref={provided.innerRef}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...provided.droppableProps}
        >
          {children}
          {provided.placeholder}
        </StyledTbody>
      )}
    </Droppable>
  );
};
