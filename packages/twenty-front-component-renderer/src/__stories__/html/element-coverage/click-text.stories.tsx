import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createHtmlElementClickStory } from '../../shared/test-utils/createHtmlElementStory';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../shared/test-utils/createFrontComponentStoryMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HTML/ElementCoverage/Click/Text',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const Div = createHtmlElementClickStory('div');
export const Span = createHtmlElementClickStory('span');
export const Section = createHtmlElementClickStory('section');
export const Article = createHtmlElementClickStory('article');
export const Header = createHtmlElementClickStory('header');
export const Footer = createHtmlElementClickStory('footer');
export const Main = createHtmlElementClickStory('main');
export const Nav = createHtmlElementClickStory('nav');
export const Aside = createHtmlElementClickStory('aside');
export const P = createHtmlElementClickStory('p');
export const H1 = createHtmlElementClickStory('h1');
export const H2 = createHtmlElementClickStory('h2');
export const H3 = createHtmlElementClickStory('h3');
export const H4 = createHtmlElementClickStory('h4');
export const H5 = createHtmlElementClickStory('h5');
export const H6 = createHtmlElementClickStory('h6');
export const Hgroup = createHtmlElementClickStory('hgroup');
export const Address = createHtmlElementClickStory('address');
export const Search = createHtmlElementClickStory('search');
export const Pre = createHtmlElementClickStory('pre');
export const Blockquote = createHtmlElementClickStory('blockquote');
export const Menu = createHtmlElementClickStory('menu');
