import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import styled from '@emotion/styled';
import { capitalize } from 'twenty-shared';

const StyledChip = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledAvatarContainer = styled.div`
  display: flex;
`;

export const CommandMenuContextRecordChip = ({
  objectMetadataItemId,
}: {
  objectMetadataItemId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const { records, loading, totalCount } =
    useFindManyRecordsSelectedInContextStore({
      limit: 3,
    });

  if (loading || !totalCount) {
    return null;
  }

  return (
    <StyledChip>
      <StyledAvatarContainer>
        {records.map((record) => (
          <CommandMenuContextRecordChipAvatars
            objectMetadataItem={objectMetadataItem}
            key={record.id}
            record={record}
          />
        ))}
      </StyledAvatarContainer>
      {totalCount === 1
        ? getObjectRecordIdentifier({ objectMetadataItem, record: records[0] })
            .name
        : `${totalCount} ${capitalize(objectMetadataItem.namePlural)}`}
    </StyledChip>
  );
};
