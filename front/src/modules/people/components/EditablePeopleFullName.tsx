import { useState } from 'react';
import styled from '@emotion/styled';

import { CellCommentChip } from '@/comments/components/CellCommentChip';
import { useOpenCommentRightDrawer } from '@/comments/hooks/useOpenCommentRightDrawer';
import { EditableDoubleText } from '@/ui/components/editable-cell/types/EditableDoubleText';
import { CommentableType } from '~/generated/graphql';

import { Person } from '../interfaces/person.interface';

import { PersonChip } from './PersonChip';

type OwnProps = {
  person: Person;
  onChange: (firstname: string, lastname: string) => void;
};

const StyledDiv = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export function EditablePeopleFullName({ person, onChange }: OwnProps) {
  const [firstnameValue, setFirstnameValue] = useState(person.firstname ?? '');
  const [lastnameValue, setLastnameValue] = useState(person.lastname ?? '');
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
        type: CommentableType.Person,
        id: person.id,
      },
    ]);
  }

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
            <PersonChip name={person.firstname + ' ' + person.lastname} />
          </StyledDiv>
          <CellCommentChip
            count={person._commentCount ?? 0}
            onClick={handleCommentClick}
          />
        </>
      }
    />
  );
}
