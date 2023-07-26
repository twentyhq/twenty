import styled from '@emotion/styled';

import { EditableCellDoubleText } from '@/ui/table/editable-cell/types/EditableCellDoubleText';
import { Person } from '~/generated/graphql';

import { PersonChip } from './PersonChip';

type OwnProps = {
  person:
    | Partial<
        Pick<
          Person,
          | 'id'
          | 'firstName'
          | 'lastName'
          | 'displayName'
          | '_commentThreadCount'
        >
      >
    | null
    | undefined;
  onSubmit?: (firstName: string, lastName: string) => void;
  onCancel?: () => void;
};

const NoEditModeContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export function EditablePeopleFullName({
  person,
  onSubmit,
  onCancel,
}: OwnProps) {
  return (
    <EditableCellDoubleText
      firstValue={person?.firstName ?? ''}
      secondValue={person?.lastName ?? ''}
      firstValuePlaceholder="First name"
      secondValuePlaceholder="Last name"
      onSubmit={onSubmit}
      onCancel={onCancel}
      nonEditModeContent={
        <NoEditModeContainer>
          <PersonChip
            name={`${person?.firstName ?? ''} ${person?.lastName ?? ''}`}
            id={person?.id ?? ''}
          />
        </NoEditModeContainer>
      }
    />
  );
}
