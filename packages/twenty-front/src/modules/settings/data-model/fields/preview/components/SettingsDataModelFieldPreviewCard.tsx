import styled from '@emotion/styled';

import {
  SettingsDataModelFieldPreview,
  SettingsDataModelFieldPreviewProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreview';
import { SettingsDataModelObjectSummary } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import { Card, CardContent } from 'twenty-ui';

export type SettingsDataModelFieldPreviewCardProps =
  SettingsDataModelFieldPreviewProps & {
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

export const SettingsDataModelFieldPreviewCard = ({
  className,
  fieldMetadataItem,
  objectMetadataItem,
  relationObjectMetadataItem,
  shrink,
  withFieldLabel = true,
  pluralizeLabel = false,
}: SettingsDataModelFieldPreviewCardProps) => {
  return (
    <StyledCard className={className} fullWidth>
      <StyledCardContent>
        <SettingsDataModelObjectSummary
          objectMetadataItem={objectMetadataItem}
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
