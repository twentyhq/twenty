import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Breadcrumb } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const BreadcrumbExample = () => {
  const [activations, setActivations] = useState(0);
  const [composedActivations, setComposedActivations] = useState(0);

  return (
    <TwentyUiGalleryCard title="Breadcrumb">
      <Breadcrumb
        aria-label="Account breadcrumb"
        onClick={() => setActivations((count) => count + 1)}
        links={[
          { children: 'Objects', href: '/objects' },
          {
            children: 'Account',
            href: '/objects/account',
            render: (
              <a onClick={() => setComposedActivations((count) => count + 1)} />
            ),
          },
        ]}
      />
      <Breadcrumb
        aria-label="Truncated breadcrumb"
        style={{ width: 220 }}
        links={[
          { children: 'Settings', href: '/settings' },
          {
            children: 'A long account name that stays available when truncated',
          },
        ]}
      />
      <Text role="status">
        Activations: {activations}; Composed activations: {composedActivations}
      </Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'e5e0d2b9-5227-4376-bc92-364cb55a9f72',
  name: 'twenty-ui-breadcrumb',
  description: 'Breadcrumb links, current items, and truncation in the sandbox',
  component: BreadcrumbExample,
});
