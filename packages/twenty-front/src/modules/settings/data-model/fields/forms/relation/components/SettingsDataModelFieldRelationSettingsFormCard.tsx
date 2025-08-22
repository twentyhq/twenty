import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import {
  SettingsDataModelFieldRelationForm,
  type SettingsDataModelFieldRelationFormValues,
} from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationForm';
import { SettingsDataModelFieldRelationPreviewContent } from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationPreviewContent';
import { SettingsDataModelRelationPreviewImage } from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationPreviewImageCard';
import { SettingsDataModelRelationFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelRelationFieldPreviewCard';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type SettingsDataModelFieldRelationSettingsFormCardProps = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'name' | 'icon' | 'label' | 'type'
  >;
  objectNameSingular: string;
};

const StyledSettingsDataModelRelationFieldPreviewCard = styled(
  SettingsDataModelRelationFieldPreviewCard,
)`
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldRelationSettingsFormCard = ({
  fieldMetadataItem,
  objectNameSingular,
}: SettingsDataModelFieldRelationSettingsFormCardProps) => {
  const { watch: watchFormValue } =
    useFormContext<SettingsDataModelFieldRelationFormValues>();
  const isMobile = useIsMobile();

  const { objectMetadataItems } = useObjectMetadataItems();

  const relationObjectMetadataId = watchFormValue('relation.objectMetadataId');
  const relationObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === relationObjectMetadataId,
  );
  const relationTargetField = watchFormValue('relation.field');

  const relationType: RelationType = watchFormValue('relation.type');
  const relationTypeConfig = RELATION_TYPES[relationType];

  const oppositeRelationType =
    relationType === RelationType.MANY_TO_ONE
      ? RelationType.ONE_TO_MANY
      : RelationType.MANY_TO_ONE;

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <SettingsDataModelFieldRelationPreviewContent isMobile={isMobile}>
          <StyledSettingsDataModelRelationFieldPreviewCard
            fieldMetadataItem={{
              name: fieldMetadataItem.name,
              icon: fieldMetadataItem.icon,
              label: fieldMetadataItem.label,
              type: FieldMetadataType.RELATION,
              settings: {
                relationType: relationType,
              },
            }}
            shrink
            objectNameSingulars={[objectNameSingular]}
            fieldPreviewTargetObjectNameSingular={
              relationObjectMetadataItem?.nameSingular ?? 'company'
            }
            pluralizeLabel={relationType === RelationType.ONE_TO_MANY}
          />
          <SettingsDataModelRelationPreviewImage
            src={relationTypeConfig?.imageSrc}
            flip={relationTypeConfig?.isImageFlipped}
            alt={relationTypeConfig?.label}
            isMobile={isMobile}
          />
          <StyledSettingsDataModelRelationFieldPreviewCard
            fieldMetadataItem={{
              name: relationTargetField?.name ?? '',
              icon: relationTargetField?.icon ?? '',
              label: relationTargetField?.label ?? '',
              type: FieldMetadataType.RELATION,
              settings: {
                relationType: oppositeRelationType,
              },
            }}
            shrink
            objectNameSingulars={[
              relationObjectMetadataItem?.nameSingular ?? 'company',
            ]}
            fieldPreviewTargetObjectNameSingular={objectNameSingular}
            pluralizeLabel={oppositeRelationType === RelationType.ONE_TO_MANY}
          />
        </SettingsDataModelFieldRelationPreviewContent>
      }
      form={
        <SettingsDataModelFieldRelationForm
          fieldMetadataItem={fieldMetadataItem}
          objectMetadataItem={relationObjectMetadataItem}
        />
      }
    />
  );
};
