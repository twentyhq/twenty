import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { numberFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/numberFieldDefaultValueSchema';
import { SettingsOptionCardContent } from '@/settings/components/SettingsOptionCardContent';
import styled from '@emotion/styled';
import { type } from 'os';
import {
  IconNumber9,
  IconPercentage,
  IllustrationIconDecimal,
} from 'twenty-ui';
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
    <Controller
      name="settings"
      defaultValue={{
        decimals:
          fieldMetadataItem?.settings?.decimals ?? DEFAULT_DECIMAL_VALUE,
        type: fieldMetadataItem?.settings?.type ?? 'number',
      }}
      control={control}
      render={({ field: { onChange, value } }) => {
        const count = value?.decimals ?? 0;

        return (
          <>
            <SettingsOptionCardContent
              variant="counter"
              Icon={IllustrationIconDecimal}
              title="Number of decimals"
              description="Set the number of decimal places"
              value={count}
              onChange={(value) => onChange({ type: type, decimals: value })}
              disabled={disabled}
              exampleValue={1000}
            />
            <SettingsOptionCardContent
              variant="select"
              Icon={IllustrationIconDecimal}
              dropdownId="number-type"
              title="Number of decimals"
              description="Set the number of decimal places"
              value={type}
              onChange={(value) => onChange({ type: value, decimals: count })}
              disabled={disabled}
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
            />
          </>
        );
      }}
    />
  );
};
