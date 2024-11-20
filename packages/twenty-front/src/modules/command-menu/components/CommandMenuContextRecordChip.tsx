import { useContextStoreSelectedRecords } from '@/context-store/hooks/useContextStoreSelectedRecords';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { Avatar } from 'twenty-ui';
import { capitalize } from '~/utils/string/capitalize';

const StyledChip = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
`;

const StyledAvatarWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(0.5)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  &:not(:first-of-type) {
    margin-left: -${({ theme }) => theme.spacing(1)};
  }
`;

const StyledAvatarContainer = styled.div`
  display: flex;
`;

const CommandMenuContextRecordChipAvatars = ({
  objectMetadataItem,
  record,
}: {
  objectMetadataItem: ObjectMetadataItem;
  record: ObjectRecord;
}) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular: objectMetadataItem.nameSingular,
    record,
  });

  return (
    <StyledAvatarWrapper>
      <Avatar
        avatarUrl={recordChipData.avatarUrl}
        placeholderColorSeed={recordChipData.recordId}
        placeholder={recordChipData.name}
        size="sm"
        type="squared"
      />
    </StyledAvatarWrapper>
  );
};

export const CommandMenuContextRecordChip = () => {
  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataId ?? '',
  });

  const { records, loading, totalCount } = useContextStoreSelectedRecords({
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
