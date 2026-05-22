import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { IconTrash, useIcons } from 'twenty-ui/display';
import { IconButton, type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type SettingsObjectNewIndexFormValues } from '~/pages/settings/data-model/new-index/SettingsObjectNewIndex';

type SettingsObjectIndexFieldsFormProps = {
  indexableFields: FieldMetadataItem[];
};

const StyledFieldRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledSelectWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledPlaceholder = styled.div`
  height: ${themeCssVariables.spacing[8]};
  width: ${themeCssVariables.spacing[8]};
`;

export const SettingsObjectIndexFieldsForm = ({
  indexableFields,
}: SettingsObjectIndexFieldsFormProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { control } = useFormContext<SettingsObjectNewIndexFormValues>();

  const emptyFieldOption: SelectOption<string> = {
    label: t`Select a field`,
    value: '',
  };

  return (
    <Controller
      name="fieldMetadataIds"
      control={control}
      render={({ field: { value, onChange } }) => {
        // Render one row per picked field plus one trailing empty row that
        // acts as the implicit "add another field" affordance (same approach
        // as the webhook operations form).
        const rows: (string | null)[] = [...value, null];

        const handleSelect = (rowIndex: number, newFieldId: string) => {
          if (newFieldId === '') return;

          const next = [...value];

          if (rowIndex < value.length) {
            next[rowIndex] = newFieldId;
          } else {
            next.push(newFieldId);
          }

          onChange(next);
        };

        const handleRemove = (rowIndex: number) => {
          onChange(value.filter((_, index) => index !== rowIndex));
        };

        return (
          <>
            {rows.map((fieldId, rowIndex) => {
              // Exclude fields already used by other rows; keep this row's
              // own value so the dropdown still reflects the current choice.
              const availableOptions: SelectOption<string>[] = indexableFields
                .filter(
                  (field) => field.id === fieldId || !value.includes(field.id),
                )
                .map<SelectOption<string>>((field) => ({
                  Icon: getIcon(field.icon),
                  label: field.label,
                  value: field.id,
                }));

              const isEmptyRow = fieldId === null;

              return (
                <StyledFieldRow key={`${rowIndex}-${fieldId ?? 'empty'}`}>
                  <StyledSelectWrapper>
                    <Select
                      dropdownId={`settings-object-new-index-field-${rowIndex}`}
                      value={fieldId ?? ''}
                      options={availableOptions}
                      emptyOption={emptyFieldOption}
                      onChange={(newValue) => handleSelect(rowIndex, newValue)}
                      fullWidth
                      withSearchInput
                    />
                  </StyledSelectWrapper>
                  {isEmptyRow ? (
                    <StyledPlaceholder />
                  ) : (
                    <IconButton
                      Icon={IconTrash}
                      variant="tertiary"
                      size="medium"
                      onClick={() => handleRemove(rowIndex)}
                      ariaLabel={t`Remove field`}
                    />
                  )}
                </StyledFieldRow>
              );
            })}
          </>
        );
      }}
    />
  );
};
