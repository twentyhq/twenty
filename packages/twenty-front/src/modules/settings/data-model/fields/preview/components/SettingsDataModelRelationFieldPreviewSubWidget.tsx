import styled from '@emotion/styled';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelRelationFieldPreview } from '@/settings/data-model/fields/preview/components/SettingsDataModelRelationFieldPreview';
import { SettingsDataModelObjectPreview } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import { isDefined } from 'twenty-shared/utils';
import { Card, CardContent } from 'twenty-ui/layout';

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

const StyledCard = styled(Card)`
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  margin: auto;
`;

const StyledCardContent = styled(CardContent)`
  padding: ${({ theme }) => theme.spacing(2)};
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
    <StyledCard className={className} fullWidth>
      <StyledCardContent>
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
      </StyledCardContent>
    </StyledCard>
  );
};
