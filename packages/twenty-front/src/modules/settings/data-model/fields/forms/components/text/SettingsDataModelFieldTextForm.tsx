import { Controller, useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import styled from '@emotion/styled';
import { CardContent, IconTextWrap } from 'twenty-ui';
import { z } from 'zod';

const StyledFormCardTitle = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

type SettingsDataModelFieldTextFormProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'settings'
  >;
};

export const textFieldDefaultValueSchema = z.object({
  displayedMaxRows: z.number().nullable(),
});

export const settingsDataModelFieldtextFormSchema = z.object({
  settings: textFieldDefaultValueSchema,
});

export type SettingsDataModelFieldTextFormValues = z.infer<
  typeof settingsDataModelFieldtextFormSchema
>;

export const SettingsDataModelFieldTextForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldTextFormProps) => {
  const { control } = useFormContext<SettingsDataModelFieldTextFormValues>();
  return (
    <CardContent>
      <Controller
        name="settings"
        defaultValue={{
          displayedMaxRows: fieldMetadataItem?.settings?.displayedMaxRows || 0,
        }}
        control={control}
        render={({ field: { onChange, value } }) => {
          const displayedMaxRows = value?.displayedMaxRows ?? 0;

          return (
            <>
              <SettingsOptionCardContentSelect
                Icon={IconTextWrap}
                dropdownId="text-wrap"
                title="Wrap on record pages"
                description="Display text on multiple lines"
                value={displayedMaxRows}
                onChange={(value) => onChange({ displayedMaxRows: value })}
                disabled={disabled}
                options={[
                  {
                    label: 'Deactivated',
                    value: 0,
                  },
                  {
                    label: 'First 2 lines',
                    value: 2,
                  },
                  {
                    label: 'First 5 lines',
                    value: 5,
                  },
                  {
                    label: 'First 10 lines',
                    value: 10,
                  },
                  {
                    label: 'All lines',
                    value: 99,
                  },
                ]}
              />
            </>
          );
        }}
      />
    </CardContent>
  );
};
