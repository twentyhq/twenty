import styled from '@emotion/styled';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelFieldPreview } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreview';
import { SettingsDataModelObjectPreview } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import { Card, CardContent } from 'twenty-ui/layout';
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

const StyledCard = styled(Card)`
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledCardContent = styled(CardContent)`
  padding: ${({ theme }) => theme.spacing(2)};
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
    <StyledCard className={className} fullWidth>
      <StyledCardContent>
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
      </StyledCardContent>
    </StyledCard>
  );
};
