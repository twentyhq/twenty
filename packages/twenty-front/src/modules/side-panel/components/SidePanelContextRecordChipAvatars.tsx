import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { Avatar } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
const StyledIconWrapper = styled.div<{ withIconBackground?: boolean }>`
  background: ${({ withIconBackground }) =>
    withIconBackground ? themeCssVariables.background.primary : 'unset'};
  border-radius: ${themeCssVariables.border.radius.sm};
  border: 1px solid
    ${({ withIconBackground }) =>
      withIconBackground
        ? themeCssVariables.border.color.medium
        : 'transparent'};
  &:not(:first-of-type) {
    margin-left: -${themeCssVariables.spacing[1]};
  }
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SidePanelContextRecordChipAvatars = ({
  objectMetadataItem,
  record,
}: {
  objectMetadataItem: ObjectMetadataItem;
  record: ObjectRecord;
}) => {
  const { theme } = useContext(ThemeContext);
  const { recordChipData } = useRecordChipData({
    objectNameSingular: objectMetadataItem.nameSingular,
    record,
  });
  const { Icon, IconColor } = useGetStandardObjectIcon(
    objectMetadataItem.nameSingular,
  );
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
