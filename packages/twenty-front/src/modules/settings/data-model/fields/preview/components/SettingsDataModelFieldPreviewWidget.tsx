import { styled } from '@linaria/react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelFieldPreview } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreview';
import { SettingsDataModelObjectPreview } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import { Card, CardContent } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/computeMetadataNameFromLabel';

type SettingsDataModelFieldPreviewWidgetProps = {
  className?: string;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'options' | 'settings'
  >;
  objectNameSingular: string;
  shrink?: boolean;
  withFieldLabel?: boolean;
  pluralizeLabel?: boolean;
  fullWidth?: boolean;
};

const StyledCardContainer = styled.div`
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

export const SettingsDataModelFieldPreviewWidget = ({
  className,
  fieldMetadataItem,
  objectNameSingular,
  shrink,
  withFieldLabel = true,
  pluralizeLabel = false,
}: SettingsDataModelFieldPreviewWidgetProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  return (
    <StyledCardContainer className={className}>
      <Card fullWidth>
        <StyledCardContentContainer>
          <CardContent>
            <SettingsDataModelObjectPreview
              objectMetadataItems={[objectMetadataItem]}
              pluralizeLabel={pluralizeLabel}
            />
            <SettingsDataModelFieldPreview
              objectNameSingular={objectNameSingular}
              fieldMetadataItem={{
                label: fieldMetadataItem.label,
                icon: fieldMetadataItem.icon,
                defaultValue: fieldMetadataItem.defaultValue,
                options: fieldMetadataItem.options,
                settings: fieldMetadataItem.settings,
                type: fieldMetadataItem.type,
                name: computeMetadataNameFromLabel(fieldMetadataItem.label),
              }}
              shrink={shrink}
              withFieldLabel={withFieldLabel}
            />
          </CardContent>
        </StyledCardContentContainer>
      </Card>
    </StyledCardContainer>
  );
};
