import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconTrash } from 'twenty-ui/icon';
import { IconButton, type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsDataModelFieldSelectRowsProps = {
  values: string[];
  options: SelectOption<string>[];
  dropdownIdPrefix: string;
  onChange: (values: string[]) => void;
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

// A list of field selects with a trailing empty row to append, as used by the
// index fields form and the timeline rule trigger fields.
export const SettingsDataModelFieldSelectRows = ({
  values,
  options,
  dropdownIdPrefix,
  onChange,
}: SettingsDataModelFieldSelectRowsProps) => {
  const { t } = useLingui();

  const rows: (string | null)[] = [...values, null];

  const handleSelect = (rowIndex: number, newValue: string) => {
    if (newValue === '') {
      return;
    }

    const nextValues = [...values];

    if (rowIndex < values.length) {
      nextValues[rowIndex] = newValue;
    } else {
      nextValues.push(newValue);
    }

    onChange(nextValues);
  };

  const handleRemove = (rowIndex: number) => {
    onChange(values.filter((_, index) => index !== rowIndex));
  };

  return (
    <>
      {rows.map((value, rowIndex) => {
        const availableOptions = options.filter(
          (option) => option.value === value || !values.includes(option.value),
        );

        return (
          <StyledFieldRow key={`${rowIndex}-${value ?? 'empty'}`}>
            <StyledSelectWrapper>
              <Select
                dropdownId={`${dropdownIdPrefix}-${rowIndex}`}
                value={value ?? ''}
                options={availableOptions}
                emptyOption={{ label: t`Select a field`, value: '' }}
                onChange={(newValue) => handleSelect(rowIndex, newValue)}
                fullWidth
                withSearchInput
              />
            </StyledSelectWrapper>
            {value === null ? (
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
};
