import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Avatar } from 'twenty-ui/display';

const StyledIconWrapper = styled.div<{ withIconBackground?: boolean }>`
  background: ${({ theme, withIconBackground }) =>
    withIconBackground ? theme.background.primary : 'unset'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid
    ${({ theme, withIconBackground }) =>
      withIconBackground ? theme.border.color.medium : 'transparent'};
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
    <StyledIconWrapper
      withIconBackground={recordChipData.avatarType !== 'rounded'}
    >
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
    </StyledIconWrapper>
  );
};
