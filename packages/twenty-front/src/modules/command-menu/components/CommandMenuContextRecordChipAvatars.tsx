import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Avatar } from 'twenty-ui';

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

export const CommandMenuContextRecordChipAvatars = ({
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
