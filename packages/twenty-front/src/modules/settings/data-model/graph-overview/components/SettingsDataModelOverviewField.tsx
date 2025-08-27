import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useIcons } from 'twenty-ui/display';
import { RelationType } from '~/generated-metadata/graphql';

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

  const relatedObjectId = field.relation?.targetObjectMetadata.id;

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
