import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createHtmlElementFocusStory } from '../../shared/test-utils/createHtmlElementStory';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../shared/test-utils/createFrontComponentStoryMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HTML/ElementCoverage/FocusBlur',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Div = createHtmlElementFocusStory('div');
export const Span = createHtmlElementFocusStory('span');
export const Button = createHtmlElementFocusStory('button');
export const Anchor = createHtmlElementFocusStory('a');
export const Section = createHtmlElementFocusStory('section');
export const Article = createHtmlElementFocusStory('article');
export const Header = createHtmlElementFocusStory('header');
export const Footer = createHtmlElementFocusStory('footer');
export const Main = createHtmlElementFocusStory('main');
export const Nav = createHtmlElementFocusStory('nav');
export const P = createHtmlElementFocusStory('p');
export const H1 = createHtmlElementFocusStory('h1');
export const Form = createHtmlElementFocusStory('form');
export const Fieldset = createHtmlElementFocusStory('fieldset');
export const Details = createHtmlElementFocusStory('details');
export const Summary = createHtmlElementFocusStory('summary');
export const Dialog = createHtmlElementFocusStory('dialog');
export const Table = createHtmlElementFocusStory('table');
export const Img = createHtmlElementFocusStory('img');
export const Picture = createHtmlElementFocusStory('picture');
export const Iframe = createHtmlElementFocusStory('iframe');
export const Svg = createHtmlElementFocusStory('svg');
export const Label = createHtmlElementFocusStory('label');
export const Output = createHtmlElementFocusStory('output');
export const Progress = createHtmlElementFocusStory('progress');
export const Meter = createHtmlElementFocusStory('meter');
export const Ul = createHtmlElementFocusStory('ul');
export const Li = createHtmlElementFocusStory('li');
