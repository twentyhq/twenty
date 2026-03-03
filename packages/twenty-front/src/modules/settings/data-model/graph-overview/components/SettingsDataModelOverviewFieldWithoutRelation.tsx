import { useContext } from 'react';
import { styled } from '@linaria/react';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useIcons } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type ObjectFieldRowWithoutRelationProps = {
  field: FieldMetadataItem;
};

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  position: relative;
  width: 100%;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledFieldName = styled.div`
  color: ${themeCssVariables.font.color.primary};
`;

export const ObjectFieldRowWithoutRelation = ({
  field,
}: ObjectFieldRowWithoutRelationProps) => {
  const { getIcon } = useIcons();
  const { theme } = useContext(ThemeContext);

  const Icon = getIcon(field?.icon);

  return (
    <StyledRow>
      {Icon && <Icon size={theme.icon.size.md} />}
      <StyledFieldName>{field.label}</StyledFieldName>
    </StyledRow>
  );
};
