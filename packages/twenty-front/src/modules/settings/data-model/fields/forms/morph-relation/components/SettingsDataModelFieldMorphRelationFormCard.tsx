import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import {
  SettingsDataModelFieldMorphRelationForm,
  type SettingsDataModelFieldMorphRelationFormValues,
} from '@/settings/data-model/fields/forms/morph-relation/components/SettingsDataModelFieldMorphRelationForm';
import { SettingsDataModelFieldRelationPreviewContent } from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationPreviewContent';
import { SettingsDataModelRelationPreviewImage } from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationPreviewImageCard';
import { SettingsDataModelRelationFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelRelationFieldPreviewCard';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type SettingsDataModelFieldMorphRelationFormCardProps = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'name' | 'icon' | 'label' | 'type'
  >;
  objectNameSingular: string;
};

const StyledMorphRelationFieldPreviewCard = styled(
  SettingsDataModelRelationFieldPreviewCard,
)`
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldMorphRelationFormCard = ({
  fieldMetadataItem,
  objectNameSingular,
}: SettingsDataModelFieldMorphRelationFormCardProps) => {
  const { watch: watchFormValue } =
    useFormContext<SettingsDataModelFieldMorphRelationFormValues>();
  const isMobile = useIsMobile();

  const { objectMetadataItems } = useObjectMetadataItems();

  const relationObjectMetadataIds = watchFormValue(
    'morphRelationObjectMetadataIds',
  );

  const relationObjectMetadataItems = relationObjectMetadataIds
    .map((relationObjectMetadataId) =>
      objectMetadataItems.find((item) => item.id === relationObjectMetadataId),
    )
    .filter(isDefined);

  const fallbackRelationObjectMetadataItem = objectMetadataItems[0];

  const relationType: RelationType = watchFormValue('relationType');
  const targetFieldName = watchFormValue('targetFieldLabel');

  const relationTypeConfig = RELATION_TYPES[relationType];

  const oppositeRelationType =
    relationType === RelationType.MANY_TO_ONE
      ? RelationType.ONE_TO_MANY
      : RelationType.MANY_TO_ONE;

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <SettingsDataModelFieldRelationPreviewContent isMobile={isMobile}>
          <StyledMorphRelationFieldPreviewCard
            fieldMetadataItem={{
              ...fieldMetadataItem,
              settings: {
                relationType,
              },
            }}
            shrink
            objectNameSingulars={[objectNameSingular]}
            fieldPreviewTargetObjectNameSingular={
              relationObjectMetadataItems[0]?.nameSingular ??
              fallbackRelationObjectMetadataItem.nameSingular
            }
            pluralizeLabel={
              watchFormValue('relationType') === RelationType.MANY_TO_ONE
            }
          />
          <SettingsDataModelRelationPreviewImage
            src={relationTypeConfig.imageSrc}
            flip={relationTypeConfig.isImageFlipped}
            alt={relationTypeConfig.label}
            isMobile={isMobile}
          />
          <StyledMorphRelationFieldPreviewCard
            fieldMetadataItem={{
              name: targetFieldName,
              icon: fieldMetadataItem.icon,
              label: fieldMetadataItem.label,
              type: FieldMetadataType.RELATION,
              settings: {
                relationType: oppositeRelationType,
              },
            }}
            shrink
            objectNameSingulars={
              relationObjectMetadataItems.length > 0
                ? relationObjectMetadataItems.map((item) => item.nameSingular)
                : [fallbackRelationObjectMetadataItem.nameSingular]
            }
            fieldPreviewTargetObjectNameSingular={objectNameSingular}
            pluralizeLabel={
              watchFormValue('relationType') !== RelationType.MANY_TO_ONE
            }
          />
        </SettingsDataModelFieldRelationPreviewContent>
      }
      form={
        <SettingsDataModelFieldMorphRelationForm
          fieldMetadataItem={fieldMetadataItem}
        />
      }
    />
  );
};
