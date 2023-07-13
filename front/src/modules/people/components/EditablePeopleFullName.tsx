import styled from '@emotion/styled';

import { CellCommentChip } from '@/comments/components/table/CellCommentChip';
import { useOpenTimelineRightDrawer } from '@/comments/hooks/useOpenTimelineRightDrawer';
import { EditableCellDoubleText } from '@/ui/components/editable-cell/types/EditableCellDoubleText';
import { CommentableType, Person } from '~/generated/graphql';

import { PersonChip } from './PersonChip';

type OwnProps = {
  person:
    | Partial<
        Pick<Person, 'id' | 'firstName' | 'lastName' | '_commentThreadCount'>
      >
    | null
    | undefined;
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
  const openCommentRightDrawer = useOpenTimelineRightDrawer();

  function handleDoubleTextChange(
    firstValue: string,
    secondValue: string,
  ): void {
    onChange(firstValue, secondValue);
  }

  function handleCommentClick(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!person) {
      return;
    }

    openCommentRightDrawer([
      {
        type: CommentableType.Person,
        id: person.id ?? '',
      },
    ]);
  }

  return (
    <EditableCellDoubleText
      firstValue={person?.firstName ?? ''}
      secondValue={person?.lastName ?? ''}
      firstValuePlaceholder="First name"
      secondValuePlaceholder="Last name"
      onChange={handleDoubleTextChange}
      nonEditModeContent={
        <NoEditModeContainer>
          <PersonChip
            name={person?.firstName + ' ' + person?.lastName}
            id={person?.id ?? ''}
          />
          <RightContainer>
            <CellCommentChip
              count={person?._commentThreadCount ?? 0}
              onClick={handleCommentClick}
            />
          </RightContainer>
        </NoEditModeContainer>
      }
    />
  );
}
