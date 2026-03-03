import { styled } from '@linaria/react';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { Icon123, useIcons } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EventFieldDiffLabelProps = {
  fieldMetadataItem: FieldMetadataItem;
};

const StyledUpdatedFieldContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  color: ${themeCssVariables.font.color.tertiary};
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
