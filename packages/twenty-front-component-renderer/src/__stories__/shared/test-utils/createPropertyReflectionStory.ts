import { type StoryObj } from '@storybook/react-vite';
import { within } from 'storybook/test';

import { type FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { PROPERTY_FIXTURE } from '../front-components/property-fixture';

import { expectFrontComponentMounted } from './matchers/expectFrontComponentMounted';
import {
  expectAttributesReflected,
  expectPropertiesReflected,
} from './matchers/expectPropertyReflected';
import { runFrontComponentStory } from './runFrontComponentStory';

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
  scenarioId: string;
  extraAttributes?: Record<string, string>;
  extraProperties?: Record<string, string | number | boolean>;
};

export const createPropertyReflectionStory = ({
  scenarioId,
  extraAttributes = {},
  extraProperties = {},
}: CreatePropertyReflectionStoryParams): Story =>
  runFrontComponentStory({
    frontComponentBundleName: 'property-reflection',
    scenarioId,
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
