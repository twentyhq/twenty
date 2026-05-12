import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { Handle, Position } from '@xyflow/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { RelationType } from '~/generated-metadata/graphql';

type ObjectFieldRowProps = {
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

export const ObjectFieldRow = ({ field }: ObjectFieldRowProps) => {
  const { theme } = useContext(ThemeContext);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const relatedObjectId = field.relation?.targetObjectMetadata.id;

  const relatedObject = objectMetadataItems.find(
    (x) => x.id === relatedObjectId,
  );

  return (
    <StyledRow>
      {isDefined(relatedObject) && (
        <ObjectMetadataIcon
          objectMetadataItem={relatedObject}
          size={theme.icon.size.md}
        />
      )}
      <StyledFieldName>{relatedObject?.labelPlural ?? ''}</StyledFieldName>
      <Handle
        type={
          field.relation?.type === RelationType.ONE_TO_MANY
            ? 'source'
            : 'target'
        }
        position={Position.Right}
        id={`${field.id}-right`}
        className={
          field.relation?.type === RelationType.ONE_TO_MANY
            ? 'right-handle source-handle'
            : 'right-handle target-handle'
        }
      />
      <Handle
        type={
          field.relation?.type === RelationType.ONE_TO_MANY
            ? 'source'
            : 'target'
        }
        position={Position.Left}
        id={`${field.id}-left`}
        className={
          field.relation?.type === RelationType.ONE_TO_MANY
            ? 'left-handle source-handle'
            : 'left-handle target-handle'
        }
      />
    </StyledRow>
  );
};
