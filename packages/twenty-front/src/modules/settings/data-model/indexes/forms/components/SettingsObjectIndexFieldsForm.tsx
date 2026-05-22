import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { Checkbox } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type SettingsObjectNewIndexFormValues } from '~/pages/settings/data-model/new-index/SettingsObjectNewIndex';

type SettingsObjectIndexFieldsFormProps = {
  indexableFields: FieldMetadataItem[];
};

const StyledFieldList = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledFieldRow = styled.label`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledFieldLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledOrderBadge = styled.span`
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  min-width: 18px;
  padding: 1px 6px;
  text-align: center;
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

export const SettingsObjectIndexFieldsForm = ({
  indexableFields,
}: SettingsObjectIndexFieldsFormProps) => {
  const { t } = useLingui();
  const { control } = useFormContext<SettingsObjectNewIndexFormValues>();

  return (
    <Controller
      name="fieldMetadataIds"
      control={control}
      render={({ field: { value, onChange } }) => {
        const handleToggle = (fieldId: string) => {
          if (value.includes(fieldId)) {
            onChange(value.filter((id) => id !== fieldId));
          } else {
            onChange([...value, fieldId]);
          }
        };

        if (indexableFields.length === 0) {
          return (
            <StyledFieldList>
              <StyledEmpty>{t`No indexable fields on this object yet.`}</StyledEmpty>
            </StyledFieldList>
          );
        }

        return (
          <StyledFieldList>
            {indexableFields.map((indexableField) => {
              const orderIndex = value.indexOf(indexableField.id);
              const isSelected = orderIndex !== -1;
              return (
                <StyledFieldRow key={indexableField.id}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(indexableField.id)}
                  />
                  <StyledFieldLabel>{indexableField.label}</StyledFieldLabel>
                  {isSelected && (
                    <StyledOrderBadge>{orderIndex + 1}</StyledOrderBadge>
                  )}
                </StyledFieldRow>
              );
            })}
          </StyledFieldList>
        );
      }}
    />
  );
};
