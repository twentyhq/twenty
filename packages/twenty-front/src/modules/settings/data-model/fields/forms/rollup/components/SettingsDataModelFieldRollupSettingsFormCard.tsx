import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { SettingsDataModelFieldRollupForm } from '@/settings/data-model/fields/forms/rollup/components/SettingsDataModelFieldRollupForm';
import { Card } from 'twenty-ui/primitives/surfaces';

type SettingsDataModelFieldRollupSettingsFormCardProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

export const SettingsDataModelFieldRollupSettingsFormCard = ({
  disabled,
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldRollupSettingsFormCardProps) => (
  <StyledSettingsSelectGroup controlWidth={180}>
    <Card.Root fullWidth>
      <SettingsDataModelFieldRollupForm
        disabled={disabled}
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
      />
    </Card.Root>
  </StyledSettingsSelectGroup>
);
