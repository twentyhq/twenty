import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { isUpdatingRecordEditableNameState } from '@/object-record/states/isUpdatingRecordEditableName';
import { EditableBreadcrumbItem } from '@/ui/navigation/bread-crumb/components/EditableBreadcrumbItem';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { capitalize } from 'twenty-shared';

const StyledEditableTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
`;

const StyledEditableTitlePrefix = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1 0 auto;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0.75)};
`;

export const RecordEditableName = ({
  objectNameSingular,
  objectRecordId,
  objectLabelPlural,
}: {
  objectNameSingular: string;
  objectRecordId: string;
  objectLabelPlural: string;
}) => {
  const [isUpdatingRecordEditableName, setIsUpdatingRecordEditableName] =
    useRecoilState(isUpdatingRecordEditableNameState);

  const { record, loading } = useFindOneRecord({
    objectNameSingular,
    objectRecordId,
    recordGqlFields: {
      name: true,
    },
  });

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular,
    recordGqlFields: {
      name: true,
    },
  });

  const handleSubmit = (value: string) => {
    updateOneRecord({
      idToUpdate: objectRecordId,
      updateOneRecordInput: {
        name: value,
      },
    });
    setIsUpdatingRecordEditableName(false);
  };

  const handleCancel = () => {
    setIsUpdatingRecordEditableName(false);
  };

  if (loading) {
    return null;
  }

  return (
    <StyledEditableTitleContainer>
      <StyledEditableTitlePrefix>
        {capitalize(objectLabelPlural)}
        <span>{' / '}</span>
      </StyledEditableTitlePrefix>
      <EditableBreadcrumbItem
        isRenaming={isUpdatingRecordEditableName}
        setIsRenaming={setIsUpdatingRecordEditableName}
        defaultValue={record?.name ?? ''}
        placeholder={'Name'}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onClickOutside={handleCancel}
        hotkeyScope="editable-breadcrumb-item"
      />
    </StyledEditableTitleContainer>
  );
};
