import { ReactNode, useContext, useState } from 'react';
import { Theme } from '@emotion/react';
import { Droppable } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { useRecoilValue } from 'recoil';
import { ThemeContext } from 'twenty-ui';
import { v4 } from 'uuid';

import { isRecordTableScrolledLeftState } from '@/object-record/record-table/states/isRecordTableScrolledLeftState';

const StyledTbody = styled.tbody<{
  theme: Theme;
  freezeFirstColumns?: boolean;
}>`
  overflow: hidden;
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
