import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
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
  const [isRenaming, setIsRenaming] = useState(false);
  const { record, loading } = useFindOneRecord({
    objectNameSingular,
    objectRecordId,
    recordGqlFields: {
      name: true,
    },
  });

  const [recordName, setRecordName] = useState(record?.name);

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
    setRecordName(record?.name);
    setIsRenaming(false);
  };

  useEffect(() => {
    setRecordName(record?.name);
  }, [record?.name]);

  if (loading) {
    return null;
  }

  return (
    <StyledEditableTitleContainer>
      <StyledEditableTitlePrefix>
        {capitalize(objectLabelPlural)}
        <span>{' / '}</span>
      </StyledEditableTitlePrefix>
      {isRenaming ? (
        <NavigationDrawerInput
          value={recordName}
          onChange={setRecordName}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onClickOutside={handleCancel}
          hotkeyScope="favorites-folder-input"
        />
      ) : (
        <NavigationDrawerItem
          label={recordName}
          onClick={() => setIsRenaming(true)}
          rightOptions={undefined}
          className="navigation-drawer-item"
          active
        />
      )}
    </StyledEditableTitleContainer>
  );
};
