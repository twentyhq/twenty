import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createBaselineFocusStory } from '../../test-utils/createBaselineStory';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/Baseline/FocusBlur',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

export const Div = createBaselineFocusStory('div');
export const Span = createBaselineFocusStory('span');
export const Button = createBaselineFocusStory('button');
export const Anchor = createBaselineFocusStory('a');
export const Section = createBaselineFocusStory('section');
export const Article = createBaselineFocusStory('article');
export const Header = createBaselineFocusStory('header');
export const Footer = createBaselineFocusStory('footer');
export const Main = createBaselineFocusStory('main');
export const Nav = createBaselineFocusStory('nav');
export const P = createBaselineFocusStory('p');
export const H1 = createBaselineFocusStory('h1');
export const Form = createBaselineFocusStory('form');
export const Fieldset = createBaselineFocusStory('fieldset');
export const Details = createBaselineFocusStory('details');
export const Summary = createBaselineFocusStory('summary');
export const Dialog = createBaselineFocusStory('dialog');
export const Table = createBaselineFocusStory('table');
export const Img = createBaselineFocusStory('img');
export const Picture = createBaselineFocusStory('picture');
export const Iframe = createBaselineFocusStory('iframe');
export const Svg = createBaselineFocusStory('svg');
export const Label = createBaselineFocusStory('label');
export const Output = createBaselineFocusStory('output');
export const Progress = createBaselineFocusStory('progress');
export const Meter = createBaselineFocusStory('meter');
export const Ul = createBaselineFocusStory('ul');
export const Li = createBaselineFocusStory('li');
