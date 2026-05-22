import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { PROPERTY_FIXTURE } from '../../shared/front-components/property-fixture';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../shared/test-utils/createFrontComponentStoryMeta';
import { createPropertyReflectionStory } from '../../shared/test-utils/createPropertyReflectionStory';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HTML/PropertyReflection/Form',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const InputText = createPropertyReflectionStory({
  scenarioId: 'property:input.text',
  extraAttributes: {
    type: PROPERTY_FIXTURE.type,
    name: PROPERTY_FIXTURE.name,
    placeholder: PROPERTY_FIXTURE.placeholder,
  },
  extraProperties: { value: PROPERTY_FIXTURE.textValue },
});

export const InputNumber = createPropertyReflectionStory({
  scenarioId: 'property:input.number',
  extraAttributes: {
    type: 'number',
    name: PROPERTY_FIXTURE.name,
  },
  extraProperties: { value: String(PROPERTY_FIXTURE.numberValue) },
});

export const Textarea = createPropertyReflectionStory({
  scenarioId: 'property:textarea',
  extraAttributes: {
    name: PROPERTY_FIXTURE.name,
    placeholder: PROPERTY_FIXTURE.placeholder,
    rows: String(PROPERTY_FIXTURE.rows),
    cols: String(PROPERTY_FIXTURE.cols),
  },
  extraProperties: { value: PROPERTY_FIXTURE.textValue },
});

export const Select = createPropertyReflectionStory({
  scenarioId: 'property:select',
  extraAttributes: { name: PROPERTY_FIXTURE.name },
  extraProperties: { value: 'alpha' },
});

export const Form = createPropertyReflectionStory({
  scenarioId: 'property:form',
});
