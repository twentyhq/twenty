import styled from '@emotion/styled';

import {
  SettingsDataModelFieldPreview,
  SettingsDataModelFieldPreviewProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreview';
import { SettingsDataModelObjectSummary } from '@/settings/data-model/objects/SettingsDataModelObjectSummary';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';

export type SettingsDataModelFieldPreviewCardProps =
  SettingsDataModelFieldPreviewProps & {
    className?: string;
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
}: SettingsDataModelFieldPreviewCardProps) => (
  <StyledCard className={className} fullWidth>
    <StyledCardContent>
      <SettingsDataModelObjectSummary objectMetadataItem={objectMetadataItem} />
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
