import { createElement, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';
import { IconStar } from 'twenty-ui/icon';
import { Badge } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const BadgeExample = () => {
  const [count, setCount] = useState(3);
  const [pointerEntries, setPointerEntries] = useState(0);
  const [buttonActivations, setButtonActivations] = useState(0);
  const [renderActivations, setRenderActivations] = useState(0);
  const [linkActivations, setLinkActivations] = useState(0);

  return (
    <TwentyUiGalleryCard title="Badge content, appearance and native roots">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <Badge aria-label="Node content badge">
          <IconStar size={12} aria-hidden="true" />
          <strong>Node content</strong>
        </Badge>
        <Badge aria-label="Extra small badge" size="xs">
          Extra small
        </Badge>
        <Badge aria-label="Small badge" size="sm">
          Small
        </Badge>
        <Badge aria-label="Medium badge" size="md">
          Medium
        </Badge>
        <Badge
          aria-label="Primary circle badge"
          size="xs"
          color="primary"
          shape="circle"
        >
          3
        </Badge>
        <Badge
          aria-label="Secondary circle badge"
          size="xs"
          color="secondary"
          shape="circle"
        >
          7
        </Badge>
        <span style={{ color: 'rgb(20, 80, 120)', fontWeight: 600 }}>
          <Badge aria-label="Inherited badge" color="inherit">
            Inherited
          </Badge>
        </span>
        <Badge aria-label="Caller supplied zero">{0}</Badge>
        {count > 0 && (
          <Badge
            aria-label="Unread messages"
            size="xs"
            color="primary"
            shape="pill"
          >
            {count > 99 ? '99+' : count}
          </Badge>
        )}
        <Button onClick={() => setCount(1200)}>Load large count</Button>
        <Button onClick={() => setCount(0)}>Clear count</Button>
        <Badge
          id="native-badge"
          aria-label="Native badge"
          title="Native badge title"
          lang="fr"
          dir="rtl"
          className="custom-badge"
          style={{ marginInlineStart: 7 }}
          onMouseEnter={() => setPointerEntries((entries) => entries + 1)}
          ref={(element) => {
            if (isDefined(element)) {
              element.dataset.refTag = element.tagName;
            }
          }}
        >
          Native content
        </Badge>
        <Badge
          aria-label="Open badge details"
          render={
            <button
              type="button"
              data-composed="button"
              onClick={() =>
                setRenderActivations((activations) => activations + 1)
              }
            />
          }
          onClick={() => setButtonActivations((activations) => activations + 1)}
          ref={(element) => {
            if (isDefined(element)) {
              element.dataset.refTag = element.tagName;
            }
          }}
        >
          Details
        </Badge>
        <Badge
          aria-label="Badge documentation"
          render={(props) =>
            createElement('a', {
              ...props,
              href: '#badge-docs',
              target: '_self',
              'data-composed': 'link',
            })
          }
          onClick={() => setLinkActivations((activations) => activations + 1)}
          ref={(element) => {
            if (isDefined(element)) {
              element.dataset.refTag = element.tagName;
            }
          }}
        >
          Documentation
        </Badge>
        <output aria-label="Native badge pointer entries">
          {pointerEntries}
        </output>
        <output aria-label="Badge button activations">
          {buttonActivations}
        </output>
        <output aria-label="Rendered button activations">
          {renderActivations}
        </output>
        <output aria-label="Badge link activations">{linkActivations}</output>
      </div>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '46ddc4e4-b0ed-4ad2-8b0c-34bdc958dc8b',
  name: 'twenty-ui-badge',
  description: 'Badge caller-owned content and native root composition',
  component: BadgeExample,
});
