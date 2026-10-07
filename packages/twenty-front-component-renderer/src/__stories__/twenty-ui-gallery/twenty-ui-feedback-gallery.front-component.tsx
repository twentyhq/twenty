import { createElement } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Callout, InlineBanner } from 'twenty-ui/components/feedback';
import {
  Banner,
  Loader,
  ProgressBar,
  Skeleton,
} from 'twenty-ui/primitives/feedback';
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
      <Banner
        status="error"
        color="blue"
        variant="soft"
        role="status"
        aria-live="polite"
        aria-label="Banner result"
        className="custom-banner"
        style={{ marginTop: 7 }}
        render={<section data-composed="true" />}
        ref={(element) => {
          if (isDefined(element)) element.dataset.refTag = element.tagName;
        }}
      >
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
        layout="compact"
        action={
          <InlineBanner.Action href={'#connection-settings'}>
            {'Connection settings'}
          </InlineBanner.Action>
        }
      >
        {'Connect your account to keep your contacts in sync.'}
      </InlineBanner>
    ),
  },
  {
    name: 'InlineBanner',
    node: <InlineBanner status="info">{'Inline message'}</InlineBanner>,
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
  {
    name: 'Skeleton',
    node: <Skeleton width={180} height={16} />,
  },
  {
    name: 'StaticSkeleton',
    node: (
      <Skeleton width={40} height={40} borderRadius="50%" animated={false} />
    ),
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
