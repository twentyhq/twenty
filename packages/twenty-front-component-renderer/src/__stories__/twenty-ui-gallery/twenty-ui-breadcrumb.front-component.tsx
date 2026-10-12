import { createElement, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';
import { Breadcrumb } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const BreadcrumbExample = () => {
  const [activations, setActivations] = useState(0);
  const [composedActivations, setComposedActivations] = useState(0);
  const [nativeActivations, setNativeActivations] = useState(0);
  const [nativeTarget, setNativeTarget] = useState('');

  return (
    <TwentyUiGalleryCard title="Breadcrumb">
      <Breadcrumb
        aria-label="Account breadcrumb"
        onClick={() => setActivations((count) => count + 1)}
        render={<nav data-composed-root="true" />}
        ref={(element) => {
          if (isDefined(element)) element.dataset.refTag = element.tagName;
        }}
        links={[
          {
            children: 'Objects',
            href: '/objects',
            target: '_self',
            rel: 'nofollow',
            download: 'objects.csv',
            hrefLang: 'en',
            referrerPolicy: 'no-referrer',
            id: 'objects-link',
            className: 'native-breadcrumb-link',
            tabIndex: 0,
            title: 'All objects',
            onClick: (event) => {
              setNativeActivations((count) => count + 1);
              setNativeTarget(
                `${event.currentTarget.tagName}:${event.currentTarget.getAttribute('href')}`,
              );
            },
            ref: (element) => {
              if (isDefined(element)) element.dataset.refTag = element.tagName;
            },
          },
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
        aria-label="Explicit current breadcrumb"
        links={[
          {
            children: 'Workspace',
            href: '/workspace',
            'aria-current': 'location',
            render: (props) =>
              createElement('a', { ...props, 'data-composed-route': 'true' }),
          },
          {
            children: 'Following',
            href: '/following',
            'aria-current': false,
            title: '',
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
        Activations: {activations}; Composed activations: {composedActivations};
        Native activations: {nativeActivations}; Native target: {nativeTarget}
      </Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'e5e0d2b9-5227-4376-bc92-364cb55a9f72',
  name: 'twenty-ui-breadcrumb',
  description:
    'Breadcrumb native links, current items, and composition in the sandbox',
  component: BreadcrumbExample,
});
