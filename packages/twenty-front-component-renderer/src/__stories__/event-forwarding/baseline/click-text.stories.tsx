import { type Meta } from '@storybook/react-vite';

import { FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';
import { createBaselineClickStory } from '../../test-utils/createBaselineStory';
import {
  PROBE_DEFAULT_ARGS,
  probeBeforeEach,
} from '../../test-utils/createProbeMeta';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/EventForwarding/Baseline/Click/Text',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: PROBE_DEFAULT_ARGS,
  beforeEach: probeBeforeEach,
};

export default meta;

export const Div = createBaselineClickStory('div');
export const Span = createBaselineClickStory('span');
export const Section = createBaselineClickStory('section');
export const Article = createBaselineClickStory('article');
export const Header = createBaselineClickStory('header');
export const Footer = createBaselineClickStory('footer');
export const Main = createBaselineClickStory('main');
export const Nav = createBaselineClickStory('nav');
export const Aside = createBaselineClickStory('aside');
export const P = createBaselineClickStory('p');
export const H1 = createBaselineClickStory('h1');
export const H2 = createBaselineClickStory('h2');
export const H3 = createBaselineClickStory('h3');
export const H4 = createBaselineClickStory('h4');
export const H5 = createBaselineClickStory('h5');
export const H6 = createBaselineClickStory('h6');
export const Hgroup = createBaselineClickStory('hgroup');
export const Address = createBaselineClickStory('address');
export const Search = createBaselineClickStory('search');
export const Pre = createBaselineClickStory('pre');
export const Blockquote = createBaselineClickStory('blockquote');
export const Menu = createBaselineClickStory('menu');
