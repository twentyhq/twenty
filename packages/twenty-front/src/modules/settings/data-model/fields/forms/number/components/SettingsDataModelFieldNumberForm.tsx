import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { numberFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/numberFieldDefaultValueSchema';
import { SettingsDataModelFieldNumberDecimalsInput } from '@/settings/data-model/fields/forms/number/components/SettingsDataModelFieldNumberDecimalInput';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { CardContent, IconNumber9, IconPercentage } from 'twenty-ui';
import { DEFAULT_DECIMAL_VALUE } from '~/utils/format/number';

export const settingsDataModelFieldNumberFormSchema = z.object({
  settings: numberFieldDefaultValueSchema,
});

export type SettingsDataModelFieldNumberFormValues = z.infer<
  typeof settingsDataModelFieldNumberFormSchema
>;

const StyledFormCardTitle = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

type SettingsDataModelFieldNumberFormProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'settings'
  >;
};

export const SettingsDataModelFieldNumberForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldNumberFormProps) => {
  const { control } = useFormContext<SettingsDataModelFieldNumberFormValues>();

  return (
    <CardContent>
      <Controller
        name="settings"
        defaultValue={{
          decimals:
            fieldMetadataItem?.settings?.decimals ?? DEFAULT_DECIMAL_VALUE,
          type: fieldMetadataItem?.settings?.type || 'number',
        }}
        control={control}
        render={({ field: { onChange, value } }) => {
          const count = value?.decimals ?? 0;
          const type = value?.type ?? 'number';

          return (
            <>
              <StyledFormCardTitle>Type</StyledFormCardTitle>
              <Select
                disabled={disabled}
                dropdownId="selectNumberTypes"
                options={[
                  {
                    label: 'Number',
                    value: 'number',
                    Icon: IconNumber9,
                  },
                  {
                    label: 'Percentage',
                    value: 'percentage',
                    Icon: IconPercentage,
                  },
                ]}
                value={type}
                onChange={(value) => onChange({ type: value, decimals: count })}
                withSearchInput={false}
                dropdownWidthAuto={true}
              />
              <br />
              <SettingsDataModelFieldNumberDecimalsInput
                value={count}
                onChange={(value) => onChange({ type: type, decimals: value })}
                disabled={disabled}
              />
            </>
          );
        }}
      />
    </CardContent>
  );
};
