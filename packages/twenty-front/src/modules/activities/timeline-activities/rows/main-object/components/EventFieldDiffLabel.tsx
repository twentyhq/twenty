import styled from '@emotion/styled';
import { Icon123, useIcons } from 'twenty-ui';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

type EventFieldDiffLabelProps = {
  fieldMetadataItem: FieldMetadataItem;
};

const StyledUpdatedFieldContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledUpdatedFieldIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 14px;
  width: 14px;
`;

export const EventFieldDiffLabel = ({
  fieldMetadataItem,
}: EventFieldDiffLabelProps) => {
  const { getIcon } = useIcons();

  const IconComponent = fieldMetadataItem?.icon
    ? getIcon(fieldMetadataItem?.icon)
    : Icon123;

  return (
    <StyledUpdatedFieldContainer>
      <StyledUpdatedFieldIconContainer>
        <IconComponent />
      </StyledUpdatedFieldIconContainer>
      {fieldMetadataItem.label}
    </StyledUpdatedFieldContainer>
  );
};
