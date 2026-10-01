import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { styled } from '@linaria/react';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
const StyledIconWrapper = styled.div<{
  withIconBackground?: boolean;
  borderColor: string;
}>`
  align-items: center;
  background: ${({ withIconBackground }) =>
    withIconBackground ? themeCssVariables.background.primary : 'unset'};
  border: 1px solid
    ${({ withIconBackground, borderColor }) =>
      withIconBackground ? borderColor : 'transparent'};
  &:not(:first-of-type) {
    margin-left: -${themeCssVariables.spacing[1]};
  }
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  justify-content: center;
`;

export const SidePanelContextRecordChipAvatars = ({
  objectMetadataItem,
  record,
  borderColor = themeCssVariables.border.color.medium,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  record: ObjectRecord;
  borderColor?: string;
}) => {
  const theme = useTheme();
  const { recordChipData } = useRecordChipData({
    objectNameSingular: objectMetadataItem.nameSingular,
    record,
  });
  const { Icon, IconColor } = useGetStandardObjectIcon(
    objectMetadataItem.nameSingular,
  );
  return (
    <StyledIconWrapper
      withIconBackground={recordChipData.avatarShape !== 'circle'}
      borderColor={borderColor}
    >
      {Icon ? (
        <Icon color={IconColor} size={theme.icon.size.sm} />
      ) : (
        <Avatar
          src={getAbsoluteImageUrl(recordChipData.avatarUrl)}
          colorSeed={recordChipData.recordId}
          name={recordChipData.name}
          shape={recordChipData.avatarShape}
          size="sm"
        />
      )}
    </StyledIconWrapper>
  );
};
