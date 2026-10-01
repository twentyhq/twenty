import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { InlineBanner } from 'twenty-ui/components';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const InlineBannerExample = () => {
  const [retryCount, setRetryCount] = useState(0);

  return (
    <TwentyUiGalleryCard title="Inline banner actions">
      <InlineBanner
        variant="compact"
        color="danger"
        message="Contact sync could not finish. Retry to reconnect your account."
        button={{
          title: 'Retry sync',
          onClick: () => setRetryCount((count) => count + 1),
        }}
      />
      <Text>Retry count: {retryCount}</Text>
      <InlineBanner
        variant="compact"
        message="Connect your account to keep your contacts in sync."
        button={{
          title: 'Connection settings',
          href: 'https://twenty.com',
          target: '_blank',
          rel: 'noopener noreferrer',
          render: (
            <a
              href="https://twenty.com"
              aria-label="Open connection settings"
            />
          ),
        }}
      />
      <InlineBanner message="Mailbox needs attention." />
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'a8716125-5bde-4c64-9333-b36d0f50c646',
  name: 'twenty-ui-inline-banner',
  description: 'Inline banner links and keyboard actions in the sandbox',
  component: InlineBannerExample,
});
