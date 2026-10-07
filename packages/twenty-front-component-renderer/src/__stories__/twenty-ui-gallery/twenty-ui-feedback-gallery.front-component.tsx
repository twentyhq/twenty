import { createElement } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Callout, InlineBanner } from 'twenty-ui/components/feedback';
import { Banner, Loader, ProgressBar } from 'twenty-ui/primitives/feedback';
import { isDefined } from 'twenty-shared/utils';
import 'twenty-ui/style.css';
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
    name: 'InlineBanner compact link',
    node: (
      <InlineBanner
        variant="compact"
        message="Connect your account to keep your contacts in sync."
        button={{ title: 'Connection settings', href: '#connection-settings' }}
      />
    ),
  },
  {
    name: 'InlineBanner',
    node: <InlineBanner color="blue" message="Inline message" />,
  },
  {
    name: 'Loader',
    node: (
      <Loader
        color="blue"
        role="status"
        aria-label="Loading results"
        className="custom-loader"
        style={{ borderColor: '#123456' }}
        render={(props) =>
          createElement('span', { ...props, 'data-composed': 'true' })
        }
        ref={(element) => {
          if (isDefined(element)) {
            element.dataset.refTag = element.tagName;
          }
        }}
      />
    ),
  },
  {
    name: 'DecorativeLoader',
    node: <Loader aria-hidden="true" />,
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
