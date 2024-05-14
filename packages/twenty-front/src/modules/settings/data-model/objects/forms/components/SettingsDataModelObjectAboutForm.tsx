import { Controller, useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import { z } from 'zod';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';

export const settingsDataModelObjectAboutFormSchema =
  objectMetadataItemSchema.pick({
    description: true,
    icon: true,
    labelPlural: true,
    labelSingular: true,
  });

type SettingsDataModelObjectAboutFormValues = z.infer<
  typeof settingsDataModelObjectAboutFormSchema
>;

type SettingsDataModelObjectAboutFormProps = {
  disabled?: boolean;
  objectMetadataItem?: ObjectMetadataItem;
};

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SettingsDataModelObjectAboutForm = ({
  disabled,
  objectMetadataItem,
}: SettingsDataModelObjectAboutFormProps) => {
  const { control } = useFormContext<SettingsDataModelObjectAboutFormValues>();

  return (
    <>
      <StyledInputsContainer>
        <StyledInputContainer>
          <StyledLabel>Icon</StyledLabel>
          <Controller
            name="icon"
            control={control}
            defaultValue={objectMetadataItem?.icon ?? 'IconListNumbers'}
            render={({ field: { onChange, value } }) => (
              <IconPicker
                disabled={disabled}
                selectedIconKey={value}
                onChange={({ iconKey }) => onChange(iconKey)}
              />
            )}
          />
        </StyledInputContainer>
        {[
          {
            label: 'Singular',
            fieldName: 'labelSingular' as const,
            placeholder: 'Listing',
            defaultValue: objectMetadataItem?.labelSingular,
          },
          {
            label: 'Plural',
            fieldName: 'labelPlural' as const,
            placeholder: 'Listings',
            defaultValue: objectMetadataItem?.labelPlural,
          },
        ].map(({ defaultValue, fieldName, label, placeholder }) => (
          <Controller
            key={`object-${fieldName}-text-input`}
            name={fieldName}
            control={control}
            defaultValue={defaultValue}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={label}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                fullWidth
              />
            )}
          />
        ))}
      </StyledInputsContainer>
      <Controller
        name="description"
        control={control}
        defaultValue={objectMetadataItem?.description ?? null}
        render={({ field: { onChange, value } }) => (
          <TextArea
            placeholder="Write a description"
            minRows={4}
            value={value ?? undefined}
            onChange={(nextValue) => onChange(nextValue ?? null)}
            disabled={disabled}
          />
        )}
      />
    </>
  );
};
