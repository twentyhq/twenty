import { useOpenPlayground } from '@/settings/playground/hooks/useOpenPlayground';
import { SETTINGS_PLAYGROUND_FORM_SCHEMA_SELECT_OPTIONS } from '@/settings/playground/constants/SettingsPlaygroundFormSchemaSelectOptions';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { PlaygroundTypes } from '@/settings/playground/types/PlaygroundTypes';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import { IconApi, IconBrandGraphql } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { z } from 'zod';

const playgroundSetupFormSchema = z.object({
  schema: z.enum(PlaygroundSchemas),
  playgroundType: z.enum(PlaygroundTypes),
});

type PlaygroundSetupFormValues = z.infer<typeof playgroundSetupFormSchema>;

const StyledForm = styled.form`
  align-items: end;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr auto;
  width: 100%;
`;

export const PlaygroundSetupForm = () => {
  const { t } = useLingui();
  const openPlayground = useOpenPlayground();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PlaygroundSetupFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(playgroundSetupFormSchema),
    defaultValues: {
      schema: PlaygroundSchemas.CORE,
      playgroundType: PlaygroundTypes.REST,
    },
  });

  const onSubmit = async (values: PlaygroundSetupFormValues) => {
    await openPlayground(values.playgroundType, values.schema);
  };

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="schema"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select
            dropdownId="schema"
            label={t`Schema`}
            options={SETTINGS_PLAYGROUND_FORM_SCHEMA_SELECT_OPTIONS.map(
              (option) => ({
                ...option,
                label: t(option.label),
              }),
            )}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Controller
        name="playgroundType"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Select
            dropdownId="apiPlaygroundType"
            label={t`API`}
            options={[
              { value: PlaygroundTypes.REST, label: t`REST`, Icon: IconApi },
              {
                value: PlaygroundTypes.GRAPHQL,
                label: t`GraphQL`,
                Icon: IconBrandGraphql,
              },
            ]}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Button
        title={t`Launch`}
        variant="primary"
        accent="blue"
        type="submit"
        disabled={isSubmitting}
      />
    </StyledForm>
  );
};
