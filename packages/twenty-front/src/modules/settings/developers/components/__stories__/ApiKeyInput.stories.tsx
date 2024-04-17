import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { ApiKeyInput } from '@/settings/developers/components/ApiKeyInput';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const meta: Meta<typeof ApiKeyInput> = {
  title: 'Modules/Settings/Developers/ApiKeys/ApiKeyInput',
  component: ApiKeyInput,
  decorators: [ComponentDecorator, SnackBarDecorator],
  args: {
    apiKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0d2VudHktN2VkOWQyMTItMWMyNS00ZDAyLWJmMjUtNmFlY2NmN2VhNDE5IiwiaWF0IjoxNjk4MTQyODgyLCJleHAiOjE2OTk0MDE1OTksImp0aSI6ImMyMmFiNjQxLTVhOGYtNGQwMC1iMDkzLTk3MzUwYTM2YzZkOSJ9.JIe2TX5IXrdNl3n-kRFp3jyfNUE7unzXZLAzm2Gxl98',
  },
};
export default meta;
type Story = StoryObj<typeof ApiKeyInput>;

export const Default: Story = {};
