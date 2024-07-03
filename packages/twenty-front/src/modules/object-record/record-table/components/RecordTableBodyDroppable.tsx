import { ReactNode, useContext, useState } from 'react';
import { Theme } from '@emotion/react';
import { Droppable } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { useRecoilValue } from 'recoil';
import { MOBILE_VIEWPORT, ThemeContext } from 'twenty-ui';
import { v4 } from 'uuid';

import { isRecordTableScrolledLeftState } from '@/object-record/record-table/states/isRecordTableScrolledLeftState';

const StyledTbody = styled.tbody<{
  theme: Theme;
  freezeFirstColumns?: boolean;
}>`
  overflow: hidden;

  td {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
    color: ${({ theme }) => theme.font.color.primary};
    border-right: 1px solid ${({ theme }) => theme.border.color.light};

    padding: 0;

    text-align: left;

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-top-color: transparent;
      border-bottom-color: transparent;
    }
  }

  td:nth-of-type(1),
  td:nth-of-type(2),
  td:nth-of-type(3) {
    position: sticky;
    z-index: 1;
  }

  td:nth-of-type(1) {
    left: 0;
    z-index: 7;
  }

  td:nth-of-type(2) {
    left: 9px;
    z-index: 5;
  }

  td:nth-of-type(3) {
    left: 39px;
    z-index: 6;

    ${({ freezeFirstColumns }) =>
      freezeFirstColumns
        ? `@media (max-width: ${MOBILE_VIEWPORT}px) {
      width: 35px;
      max-width: 35px;
    }`
        : ''}
  }
`;

export const RecordTableBodyDroppable = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [v4Persistable] = useState(v4());

  const { theme } = useContext(ThemeContext);

  const isRecordTableScrolledLeft = useRecoilValue(
    isRecordTableScrolledLeftState,
  );

  return (
    <Droppable droppableId={v4Persistable}>
      {(provided) => (
        <StyledTbody
          theme={theme}
          freezeFirstColumns={!isRecordTableScrolledLeft}
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
