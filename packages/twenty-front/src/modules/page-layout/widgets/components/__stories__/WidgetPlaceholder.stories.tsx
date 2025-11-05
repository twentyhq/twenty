import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { WidgetPlaceholder } from '@/page-layout/widgets/components/WidgetPlaceholder';
import { type Meta, type StoryObj } from '@storybook/react';
import { type MutableSnapshot } from 'recoil';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const meta: Meta<typeof WidgetPlaceholder> = {
  title: 'Modules/PageLayout/Widgets/WidgetPlaceholder',
  component: WidgetPlaceholder,
  decorators: [
    (Story) => {
      const initializeState = (snapshot: MutableSnapshot) => {
        snapshot.set(
          objectMetadataItemsState,
          generatedMockObjectMetadataItems,
        );
        snapshot.set(shouldAppBeLoadingState, false);
      };

      return (
        <PageLayoutTestWrapper initializeState={initializeState}>
          <Story />
        </PageLayoutTestWrapper>
      );
    },
    ComponentDecorator,
    I18nFrontDecorator,
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A self-contained placeholder widget that appears when no widgets are present. Automatically enables edit mode when clicked and opens the widget type selection command menu.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WidgetPlaceholder>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default widget placeholder state. Click to trigger the add widget flow.',
      },
    },
  },
};
