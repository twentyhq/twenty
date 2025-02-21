import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

export const apiPlaygroundSetupFormSchema = z.object({
    apiKey: z.string(),
    schema: z.string(),
    playground: z.string()
})

type ApiPlaygroundSetupFormValues = z.infer<
  typeof apiPlaygroundSetupFormSchema
>;

type ApiPlaygroundFormProps = {
  onBlur?: () => void;
};

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const ApiPlaygroundSetupForm = ({
  onBlur,
}: ApiPlaygroundFormProps) => {
  const { t } = useLingui();

  const { control } =
    useForm<ApiPlaygroundSetupFormValues>({
        mode: 'onTouched',
        resolver: zodResolver(apiPlaygroundSetupFormSchema),
    });

  return (
    <StyledInputsContainer>
        <Controller
            name={'apiKey'}
            control={control}
            // defaultValue={objectMetadataItem?.icon ?? 'IconListNumbers'}
            render={({ field: { onChange, value } }) => (
                <TextInput
                    label={'API Key'}
                    placeholder={'Listing'}
                    value={value}
                    onChange={(value) => {
                        onChange(value);
                    }}
                    onBlur={onBlur}
                //   disabled={disableEdition}
                    fullWidth
                />
            )}
        />
        <Controller
            name={'schema'}
            control={control}
        //   defaultValue={objectMetadataItem?.labelSingular}
            render={({ field: { onChange, value } }) => (
            <TextInput
                label={'Schema'}
                placeholder={'Listing'}
                value={value}
                onChange={(value) => {
                onChange(value);
                }}
                onBlur={onBlur}
            //   disabled={disableEdition}
                fullWidth
            />
            )}
        />
        <Controller
            name={'playground'}
            control={control}
        //   defaultValue={objectMetadataItem?.labelPlural}
            render={({ field: { onChange, value } }) => (
            <TextInput
                label={t`Plural`}
                placeholder={t`Listings`}
                value={value}
                onChange={(value) => {
                onChange(value);
                }}
            //   disabled={disableEdition}
                fullWidth
            />
            )}
        />
    </StyledInputsContainer>
  );
};
