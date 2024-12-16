import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RelationDefinitionType } from '~/generated-metadata/graphql';

type ObjectFieldRowProps = {
  field: FieldMetadataItem;
};

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  position: relative;
  width: 100%;
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledFieldName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
`;

export const ObjectFieldRow = ({ field }: ObjectFieldRowProps) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { getIcon } = useIcons();
  const theme = useTheme();

  const relatedObjectId = field.relationDefinition?.targetObjectMetadata.id;

  const relatedObject = objectMetadataItems.find(
    (x) => x.id === relatedObjectId,
  );

  const Icon = getIcon(relatedObject?.icon);

  return (
    <StyledRow>
      {Icon && <Icon size={theme.icon.size.md} />}
      <StyledFieldName>{relatedObject?.labelPlural ?? ''}</StyledFieldName>
      <Handle
        type={
          field.relationDefinition?.direction ===
          RelationDefinitionType.OneToMany
            ? 'source'
            : 'target'
        }
        position={Position.Right}
        id={`${field.id}-right`}
        className={
          field.relationDefinition?.direction ===
          RelationDefinitionType.OneToMany
            ? 'right-handle source-handle'
            : 'right-handle target-handle'
        }
      />
      <Handle
        type={
          field.relationDefinition?.direction ===
          RelationDefinitionType.OneToMany
            ? 'source'
            : 'target'
        }
        position={Position.Left}
        id={`${field.id}-left`}
        className={
          field.relationDefinition?.direction ===
          RelationDefinitionType.OneToMany
            ? 'left-handle source-handle'
            : 'left-handle target-handle'
        }
      />
    </StyledRow>
  );
};
