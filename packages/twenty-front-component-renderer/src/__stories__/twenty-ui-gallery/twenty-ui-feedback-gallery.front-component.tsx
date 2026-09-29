import { defineFrontComponent } from 'twenty-sdk/define';
import { Callout, Info, InlineBanner } from 'twenty-ui/components';
import {
  Banner,
  CircularProgressBar,
  Loader,
  ProgressBar,
} from 'twenty-ui/primitives/feedback';
import { ThemeProvider } from 'twenty-ui/theme';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const FEEDBACK_ENTRIES: GalleryEntry[] = [
  {
    name: 'Banner',
    node: (
      <Banner color="blue" variant="primary">
        Heads up
      </Banner>
    ),
  },
  {
    name: 'Callout',
    node: (
      <Callout variant="info" title="Info" description="A short description." />
    ),
  },
  {
    name: 'CircularProgressBar',
    node: <CircularProgressBar size={50} barWidth={5} />,
  },
  {
    name: 'Info',
    node: <Info accent="blue" text="Some information" />,
  },
  {
    name: 'InlineBanner',
    node: <InlineBanner color="blue" message="Inline message" />,
  },
  {
    name: 'Loader',
    node: <Loader color="blue" />,
  },
  {
    name: 'ProgressBar',
    node: <ProgressBar value={50} ariaLabel="Progress" />,
  },
];

const FeedbackGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery
      title="twenty-ui/primitives/feedback"
      entries={FEEDBACK_ENTRIES}
    />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000102',
  name: 'twenty-ui-feedback-gallery',
  description:
    'Renders every twenty-ui/primitives/feedback component in the sandbox',
  component: FeedbackGallery,
});
