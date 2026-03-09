import { type Decorator } from '@storybook/react-vite';
import { FormProvider, useForm } from 'react-hook-form';

export const FormProviderDecorator: Decorator = (Story) => {
  const formConfig = useForm();

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <Story />
    </FormProvider>
  );
};
