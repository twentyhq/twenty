import { useState } from 'react';
import styled from '@emotion/styled';

import { CellCommentChip } from '@/comments/components/comments/CellCommentChip';
import { useOpenCommentRightDrawer } from '@/comments/hooks/useOpenCommentRightDrawer';
import { EditableDoubleText } from '@/ui/components/editable-cell/types/EditableDoubleText';

import { usePeopleCommentsCountQuery } from '../../comments/services';

import { PersonChip } from './PersonChip';

type OwnProps = {
  firstname: string;
  lastname: string;
  personId: string;
  onChange: (firstname: string, lastname: string) => void;
};

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export function EditablePeopleFullName({
  firstname,
  lastname,
  onChange,
  personId,
}: OwnProps) {
  const [firstnameValue, setFirstnameValue] = useState(firstname);
  const [lastnameValue, setLastnameValue] = useState(lastname);
  const openCommentRightDrawer = useOpenCommentRightDrawer();

  function handleDoubleTextChange(
    firstValue: string,
    secondValue: string,
  ): void {
    setFirstnameValue(firstValue);
    setLastnameValue(secondValue);

    onChange(firstValue, secondValue);
  }

  function handleCommentClick(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    openCommentRightDrawer([
      {
        type: 'Person',
        id: personId,
      },
    ]);
  }

  const commentCount = usePeopleCommentsCountQuery(personId);

  const displayCommentCount = !commentCount.loading;

  return (
    <EditableDoubleText
      firstValue={firstnameValue}
      secondValue={lastnameValue}
      firstValuePlaceholder="First name"
      secondValuePlaceholder="Last name"
      onChange={handleDoubleTextChange}
      nonEditModeContent={
        <>
          <StyledDiv>
            <PersonChip name={firstname + ' ' + lastname} />
          </StyledDiv>
          {displayCommentCount && (
            <CellCommentChip
              count={commentCount.data ?? 0}
              onClick={handleCommentClick}
            />
          )}
        </>
      }
    />
  );
}
