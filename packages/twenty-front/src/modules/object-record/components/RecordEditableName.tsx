import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { isRecordEditableNameRenamingComponentState } from '@/object-record/states/isRecordEditableNameRenamingState';
import { NavigationDrawerItemInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemInput';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import styled from '@emotion/styled';
import { capitalize } from 'twenty-shared';

const StyledEditableTitleContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
`;

const StyledEditableTitlePrefix = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  line-height: 24px;
  display: flex;
  flex-direction: row;
  padding: ${({ theme }) => theme.spacing(0.75)};
  gap: ${({ theme }) => theme.spacing(1)};
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
  const [isRenaming, setIsRenaming] = useRecoilComponentStateV2(
    isRecordEditableNameRenamingComponentState,
  );

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
    setIsRenaming(false);
  };

  const handleCancel = () => {
    setIsRenaming(false);
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
      <NavigationDrawerItemInput
        isRenaming={isRenaming}
        setIsRenaming={setIsRenaming}
        defaultValue={record?.name ?? ''}
        placeholder={'Name'}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
      />
    </StyledEditableTitleContainer>
  );
};
