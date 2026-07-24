import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  AnimatedPlaceholderErrorContainer,
  AnimatedPlaceholderErrorSubTitle,
  AnimatedPlaceholderErrorTextContainer,
  AnimatedPlaceholderErrorTitle,
  Banner,
  Callout,
  CircularProgressBar,
  Info,
  InlineBanner,
  Loader,
  ProgressBar,
  SidePanelInformationBanner,
} from 'twenty-ui/feedback';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const FEEDBACK_ENTRIES: GalleryEntry[] = [
  {
    name: 'AnimatedPlaceholder',
    node: <AnimatedPlaceholder type="error404" />,
  },
  {
    name: 'AnimatedPlaceholderEmptyContainer',
    node: (
      <AnimatedPlaceholderEmptyContainer>
        Empty
      </AnimatedPlaceholderEmptyContainer>
    ),
  },
  {
    name: 'AnimatedPlaceholderEmptyTextContainer',
    node: (
      <AnimatedPlaceholderEmptyTextContainer>
        Empty text
      </AnimatedPlaceholderEmptyTextContainer>
    ),
  },
  {
    name: 'AnimatedPlaceholderEmptyTitle',
    node: (
      <AnimatedPlaceholderEmptyTitle>No records</AnimatedPlaceholderEmptyTitle>
    ),
  },
  {
    name: 'AnimatedPlaceholderEmptySubTitle',
    node: (
      <AnimatedPlaceholderEmptySubTitle>
        Try adding one
      </AnimatedPlaceholderEmptySubTitle>
    ),
  },
  {
    name: 'AnimatedPlaceholderErrorContainer',
    node: (
      <AnimatedPlaceholderErrorContainer>
        Error
      </AnimatedPlaceholderErrorContainer>
    ),
  },
  {
    name: 'AnimatedPlaceholderErrorTextContainer',
    node: (
      <AnimatedPlaceholderErrorTextContainer>
        Error text
      </AnimatedPlaceholderErrorTextContainer>
    ),
  },
  {
    name: 'AnimatedPlaceholderErrorTitle',
    node: (
      <AnimatedPlaceholderErrorTitle>Went wrong</AnimatedPlaceholderErrorTitle>
    ),
  },
  {
    name: 'AnimatedPlaceholderErrorSubTitle',
    node: (
      <AnimatedPlaceholderErrorSubTitle>
        Please retry
      </AnimatedPlaceholderErrorSubTitle>
    ),
  },
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
  {
    name: 'SidePanelInformationBanner',
    node: <SidePanelInformationBanner message="Panel info" variant="default" />,
  },
];

const FeedbackGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery title="twenty-ui/feedback" entries={FEEDBACK_ENTRIES} />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000102',
  name: 'twenty-ui-feedback-gallery',
  description: 'Renders every twenty-ui/feedback component in the sandbox',
  component: FeedbackGallery,
});
