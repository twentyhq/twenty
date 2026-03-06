import { isDefined } from 'twenty-shared/utils';
import { styled } from '@linaria/react';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useIcons } from 'twenty-ui/display';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type ObjectFieldRowWithoutRelationProps = {
  field: FieldMetadataItem;
};

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: 0 ${themeCssVariables.spacing[2]};
  position: relative;
  width: 100%;
`;

const StyledFieldName = styled.div`
  color: ${themeCssVariables.font.color.primary};
`;

export const ObjectFieldRowWithoutRelation = ({
  field,
}: ObjectFieldRowWithoutRelationProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const Icon = getIcon(field?.icon);

  return (
    <StyledRow>
      {isDefined(Icon) && <Icon size={theme.icon.size.md} />}
      <StyledFieldName>{field.label}</StyledFieldName>
    </StyledRow>
  );
};
