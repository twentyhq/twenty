import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ApiKey } from '@/settings/developers/types/api-key/ApiKey';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { IconBrandGraphql } from '@tabler/icons-react';
import { Controller, useForm } from 'react-hook-form';
import {
  Button,
  IconApi,
  IconBracketsAngle,
  IconFolderRoot
} from 'twenty-ui';
import { z } from 'zod';

export const apiPlaygroundSetupFormSchema = z.object({
    apiKey: z.string(),
    schema: z.string(),
    apiPlayground: z.string()
})

type ApiPlaygroundSetupFormValues = z.infer<
  typeof apiPlaygroundSetupFormSchema
>;

type ApiPlaygroundFormProps = {
  onBlur?: () => void;
};

const StyledInputsContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 0.5fr;
  align-items: end;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const ApiPlaygroundSetupForm = ({
  onBlur,
}: ApiPlaygroundFormProps) => {
  const { t } = useLingui();

  const { control } = useForm<ApiPlaygroundSetupFormValues>({
      mode: 'onTouched',
      resolver: zodResolver(apiPlaygroundSetupFormSchema),
  });

  const { records: apiKeys } = useFindManyRecords<ApiKey>({
      objectNameSingular: CoreObjectNameSingular.ApiKey,
      filter: { revokedAt: { is: 'NULL' } },
  });

  return (
    <StyledInputsContainer>
      <Controller
        name={'apiKey'}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select
            dropdownId="apiKey"
            label="API Key"
            options={apiKeys.map((apiKey) => ({value: apiKey.id, label: apiKey.name }))}
            value={value}
            onChange={onChange}
            callToActionButton={{ 
              text: 'Create API Key',
              onClick: () => console.log("HA")
            }}
          />
        )}
      />
      <Controller
        name={'schema'}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select
            dropdownId="schema"
            label="Schema"
            options={[
              { value: 'core', label: 'Core', Icon: IconFolderRoot },
              { value: 'metadata', label: 'Metadata', Icon: IconBracketsAngle },
            ]}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Controller
        name={'apiPlayground'}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select
            dropdownId="apiPlaygroundType"
            label="API"
            options={[
                { value: 'rest', label: 'REST', Icon: IconApi },
                { value: 'graphql', label: 'GraphQL', Icon: IconBrandGraphql },
            ]}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Button
        title="Launch"
        variant="primary"
        accent="blue"
      />
    </StyledInputsContainer>
  );
};
