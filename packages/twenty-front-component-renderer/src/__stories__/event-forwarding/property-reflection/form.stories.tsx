import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { PROPERTY_FIXTURE } from '../../example-sources/shared/property-fixture';
import { createPropertyReflectionStory } from '../../test-utils/createPropertyReflectionStory';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/PropertyReflection/Form',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
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
