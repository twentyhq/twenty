import { FormProvider, useForm } from 'react-hook-form';
import { Decorator } from '@storybook/react';

export const FormProviderDecorator: Decorator = (Story) => {
  const formConfig = useForm();

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <Story />
    </FormProvider>
  );
};
