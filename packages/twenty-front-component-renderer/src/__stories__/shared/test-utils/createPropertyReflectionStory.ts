import { type StoryObj } from '@storybook/react-vite';
import { within } from 'storybook/test';

import { type FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { PROPERTY_FIXTURE } from '@/__stories__/shared/front-components/property-fixture';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import {
  expectAttributesReflected,
  expectPropertiesReflected,
} from '@/__stories__/shared/test-utils/matchers/expectPropertyReflected';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';

type Story = StoryObj<typeof FrontComponentRenderer>;

const COMMON_ATTRIBUTES = {
  id: PROPERTY_FIXTURE.id,
  class: PROPERTY_FIXTURE.className,
  title: PROPERTY_FIXTURE.title,
  role: PROPERTY_FIXTURE.role,
  'aria-label': PROPERTY_FIXTURE.ariaLabel,
  tabindex: String(PROPERTY_FIXTURE.tabIndex),
};

type CreatePropertyReflectionStoryParams = {
  frontComponentBundleName: string;
  extraAttributes?: Record<string, string>;
  extraProperties?: Record<string, string | number | boolean>;
};

export const createPropertyReflectionStory = ({
  frontComponentBundleName,
  extraAttributes = {},
  extraProperties = {},
}: CreatePropertyReflectionStoryParams): Story =>
  runFrontComponentStory({
    frontComponentBundleName,
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);

      await expectFrontComponentMounted(canvas);

      await expectAttributesReflected({
        canvas,
        attributes: { ...COMMON_ATTRIBUTES, ...extraAttributes },
      });

      if (Object.keys(extraProperties).length > 0) {
        await expectPropertiesReflected({
          canvas,
          properties: extraProperties,
        });
      }
    },
  });
