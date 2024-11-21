import { useContextStoreSelectedRecords } from '@/context-store/hooks/useContextStoreSelectedRecords';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Avatar } from 'twenty-ui';
import { capitalize } from '~/utils/string/capitalize';

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

const StyledAvatarWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(0.5)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  &:not(:first-of-type) {
    margin-left: -${({ theme }) => theme.spacing(1)};
  }
  display: flex;
  align-items: center;
  justify-content: center;
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

  const { Icon, IconColor } = useGetStandardObjectIcon(
    objectMetadataItem.nameSingular,
  );

  const theme = useTheme();

  return (
    <StyledAvatarWrapper>
      {Icon ? (
        <Icon color={IconColor} size={theme.icon.size.sm} />
      ) : (
        <Avatar
          avatarUrl={recordChipData.avatarUrl}
          placeholderColorSeed={recordChipData.recordId}
          placeholder={recordChipData.name}
          type={recordChipData.avatarType}
          size="sm"
        />
      )}
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
