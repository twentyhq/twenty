import styled from '@emotion/styled';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsDataModelFieldPreview } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreview';
import { SettingsDataModelObjectPreview } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import { Card, CardContent } from 'twenty-ui/layout';

export type SettingsDataModelMorphRelationFieldPreviewCardProps = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    | 'icon'
    | 'label'
    | 'type'
    | 'defaultValue'
    | 'options'
    | 'settings'
    | 'relation'
  > & {
    id?: string;
    name?: string;
    morphRelations: {
      targetObjectMetadata: Pick<
        ObjectMetadataItem,
        | 'id'
        | 'nameSingular'
        | 'labelSingular'
        | 'labelPlural'
        | 'icon'
        | 'isCustom'
        | 'isRemote'
      >;
    }[];
  };
  objectMetadataItem: ObjectMetadataItem;
  relationObjectMetadataItem?: ObjectMetadataItem;
  shrink?: boolean;
  withFieldLabel?: boolean;
  className?: string;
  pluralizeLabel?: boolean;
};

const StyledCard = styled(Card)`
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledCardContent = styled(CardContent)`
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsDataModelMorphRelationFieldPreviewCard = ({
  className,
  fieldMetadataItem,
  objectMetadataItem,
  relationObjectMetadataItem,
  shrink,
  withFieldLabel = true,
  pluralizeLabel = false,
}: SettingsDataModelMorphRelationFieldPreviewCardProps) => {
  const objectMetadataItems = fieldMetadataItem.morphRelations?.map(
    (morphRelation) => morphRelation.targetObjectMetadata,
  );

  if (!objectMetadataItems || objectMetadataItems.length === 0) {
    return null;
  }

  return (
    <StyledCard className={className} fullWidth>
      <StyledCardContent>
        <SettingsDataModelObjectPreview
          objectMetadataItems={objectMetadataItems}
          pluralizeLabel={pluralizeLabel}
        />
        <SettingsDataModelFieldPreview
          objectMetadataItem={objectMetadataItem}
          fieldMetadataItem={fieldMetadataItem}
          relationObjectMetadataItem={relationObjectMetadataItem}
          shrink={shrink}
          withFieldLabel={withFieldLabel}
        />
      </StyledCardContent>
    </StyledCard>
  );
};
