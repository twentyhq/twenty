import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { FieldMetadataType } from 'twenty-shared/types';
import { IconTrash } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordVisibilityPolicyStaticCondition } from '@/settings/roles/role-permissions/object-level-permissions/record-visibility-policy/types/RecordVisibilityPolicyCondition';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFieldSelectContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledValueContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

type SettingsRolePermissionsObjectLevelRecordVisibilityPolicyConditionRowProps =
  {
    condition: RecordVisibilityPolicyStaticCondition;
    fields: FieldMetadataItem[];
    onChange: (updated: Partial<RecordVisibilityPolicyStaticCondition>) => void;
    onRemove: () => void;
  };

export const SettingsRolePermissionsObjectLevelRecordVisibilityPolicyConditionRow =
  ({
    condition,
    fields,
    onChange,
    onRemove,
  }: SettingsRolePermissionsObjectLevelRecordVisibilityPolicyConditionRowProps) => {
    const fieldOptions = fields.map((field) => ({
      label: field.label,
      value: field.name,
    }));

    const currentField = fields.find(
      (field) => field.name === condition.fieldName,
    );

    const handleFieldChange = (fieldName: string) => {
      const field = fields.find((candidate) => candidate.name === fieldName);

      if (!field) {
        return;
      }

      onChange({
        fieldMetadataId: field.id,
        fieldName: field.name,
        fieldType: field.type,
        value: '',
      });
    };

    return (
      <StyledRow>
        <StyledFieldSelectContainer>
          <Select
            dropdownId={`record-visibility-policy-field-${condition.id}`}
            options={fieldOptions}
            value={condition.fieldName}
            onChange={handleFieldChange}
            fullWidth
          />
        </StyledFieldSelectContainer>
        <StyledValueContainer>
          {condition.fieldType === FieldMetadataType.BOOLEAN ? (
            <Select
              dropdownId={`record-visibility-policy-value-${condition.id}`}
              options={[
                { label: t`True`, value: 'true' },
                { label: t`False`, value: 'false' },
              ]}
              value={condition.value === 'true' ? 'true' : 'false'}
              onChange={(value) => onChange({ value })}
              fullWidth
            />
          ) : condition.fieldType === FieldMetadataType.SELECT ? (
            <Select
              dropdownId={`record-visibility-policy-value-${condition.id}`}
              // Comparing the option's raw value (not its display label) against
              // the stored column, so a free-text input here would silently
              // never match any record.
              options={(currentField?.options ?? []).map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              value={condition.value}
              onChange={(value) => onChange({ value })}
              fullWidth
            />
          ) : (
            // ponytail: MULTI_SELECT still takes raw comma-separated option
            // values here (same label-vs-value pitfall SELECT had) — upgrade
            // to an option-aware multi-picker if that trips people up too.
            <TextInput
              value={condition.value}
              onChange={(value) => onChange({ value })}
              placeholder={
                condition.fieldType === FieldMetadataType.MULTI_SELECT
                  ? t`Comma-separated values`
                  : t`Value`
              }
              fullWidth
            />
          )}
        </StyledValueContainer>
        <IconButton
          Icon={IconTrash}
          size="small"
          variant="secondary"
          accent="danger"
          onClick={onRemove}
          ariaLabel={t`Remove condition`}
        />
      </StyledRow>
    );
  };
