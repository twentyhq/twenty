import { styled } from '@linaria/react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelRelationFieldPreview } from '@/settings/data-model/fields/preview/components/SettingsDataModelRelationFieldPreview';
import { SettingsDataModelObjectPreview } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import { isDefined } from 'twenty-shared/utils';
import { Card, CardContent } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type SettingsDataModelRelationFieldPreviewSubWidgetProps = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'settings'
  >;
  objectNameSingulars: string[];
  fieldPreviewTargetObjectNameSingular: string;
  shrink?: boolean;
  withFieldLabel?: boolean;
  className?: string;
  pluralizeLabel?: boolean;
};

const StyledCardContainer = styled.div`
  margin: auto;

  > * {
    border-radius: ${themeCssVariables.border.radius.md};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledCardContentContainer = styled.div`
  > * {
    padding: ${themeCssVariables.spacing[2]};
  }
`;

export const SettingsDataModelRelationFieldPreviewSubWidget = ({
  className,
  fieldMetadataItem,
  objectNameSingulars,
  fieldPreviewTargetObjectNameSingular,
  shrink,
  withFieldLabel = true,
  pluralizeLabel = false,
}: SettingsDataModelRelationFieldPreviewSubWidgetProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const targetObjectMetadataItems = objectNameSingulars
    .map((nameSingular) =>
      objectMetadataItems.find((item) => item.nameSingular === nameSingular),
    )
    .filter(isDefined);

  return (
    <StyledCardContainer className={className}>
      <Card fullWidth>
        <StyledCardContentContainer>
          <CardContent>
            <SettingsDataModelObjectPreview
              objectMetadataItems={targetObjectMetadataItems}
              pluralizeLabel={pluralizeLabel}
            />
            <SettingsDataModelRelationFieldPreview
              fieldMetadataItem={fieldMetadataItem}
              relationTargetObjectNameSingular={
                fieldPreviewTargetObjectNameSingular
              }
              shrink={shrink}
              withFieldLabel={withFieldLabel}
            />
          </CardContent>
        </StyledCardContentContainer>
      </Card>
    </StyledCardContainer>
  );
};
