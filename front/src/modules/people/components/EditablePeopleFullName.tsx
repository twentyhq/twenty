import { useState } from 'react';
import styled from '@emotion/styled';

import { CellCommentChip } from '@/comments/components/CellCommentChip';
import { useOpenCommentRightDrawer } from '@/comments/hooks/useOpenCommentRightDrawer';
import { EditableDoubleTextCell } from '@/ui/components/editable-cell/types/EditableDoubleTextCell';
import { CommentableType, Person } from '~/generated/graphql';

import { PersonChip } from './PersonChip';

type OwnProps = {
  person: Pick<Person, 'id' | 'firstName' | 'lastName' | '_commentCount'>;
  onChange: (firstName: string, lastName: string) => void;
};

const NoEditModeContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const RightContainer = styled.div`
  margin-left: ${(props) => props.theme.spacing(1)};
`;

export function EditablePeopleFullName({ person, onChange }: OwnProps) {
  const [firstNameValue, setFirstNameValue] = useState(person.firstName ?? '');
  const [lastNameValue, setLastNameValue] = useState(person.lastName ?? '');
  const openCommentRightDrawer = useOpenCommentRightDrawer();

  function handleDoubleTextChange(
    firstValue: string,
    secondValue: string,
  ): void {
    setFirstNameValue(firstValue);
    setLastNameValue(secondValue);

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
    <EditableDoubleTextCell
      firstValue={firstNameValue}
      secondValue={lastNameValue}
      firstValuePlaceholder="First name"
      secondValuePlaceholder="Last name"
      onChange={handleDoubleTextChange}
      nonEditModeContent={
        <NoEditModeContainer>
          <PersonChip name={person.firstName + ' ' + person.lastName} />
          <RightContainer>
            <CellCommentChip
              count={person._commentCount ?? 0}
              onClick={handleCommentClick}
            />
          </RightContainer>
        </NoEditModeContainer>
      }
    />
  );
}
