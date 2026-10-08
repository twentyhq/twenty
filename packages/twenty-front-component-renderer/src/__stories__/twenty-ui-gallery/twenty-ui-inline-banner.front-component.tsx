import { Button } from 'twenty-ui/primitives/input';
import { createElement, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { defineFrontComponent } from 'twenty-sdk/define';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const InlineBannerExample = () => {
  const [retryCount, setRetryCount] = useState(0);

  return (
    <TwentyUiGalleryCard title="Inline banner actions">
      <InlineBanner
        layout="compact"
        status="error"
        color="blue"
        variant="solid"
        role="status"
        aria-live="polite"
        aria-label="Inline sync result"
        className="custom-inline-banner"
        style={{ marginTop: 7 }}
        render={(props, state) =>
          createElement('section', {
            ...props,
            'data-render-status': state.status,
          })
        }
        ref={(element) => {
          if (isDefined(element)) element.dataset.refTag = element.tagName;
        }}
        action={
          <InlineBanner.Action
            onClick={() => setRetryCount((count) => count + 1)}
          >
            {'Retry sync'}
          </InlineBanner.Action>
        }
      >
        {'Contact sync could not finish. Retry to reconnect your account.'}
      </InlineBanner>
      <Text>Retry count: {retryCount}</Text>
      <InlineBanner
        layout="compact"
        action={
          <InlineBanner.Action
            nativeButton={false}
            role="link"
            href={'https://twenty.com'}
            target={'_blank'}
            rel={'noopener noreferrer'}
            render={
              <a
                href="https://twenty.com"
                aria-label="Open connection settings"
              />
            }
          >
            {'Connection settings'}
          </InlineBanner.Action>
        }
      >
        {'Connect your account to keep your contacts in sync.'}
      </InlineBanner>
      <InlineBanner>{'Mailbox needs attention.'}</InlineBanner>
      <InlineBanner status="warning" color="red" icon={null}>
        <Button variant="link" href="#sync-history">
          Review sync history
        </Button>
      </InlineBanner>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'a8716125-5bde-4c64-9333-b36d0f50c646',
  name: 'twenty-ui-inline-banner',
  description: 'Inline banner links and keyboard actions in the sandbox',
  component: InlineBannerExample,
});
