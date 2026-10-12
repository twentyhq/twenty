import { isDefined } from 'twenty-shared/utils';
import { createElement, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { AvatarGroup } from 'twenty-ui/components/data-display';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';
import { StatefulGroupAvatar } from './stateful-group-avatar';

const AVATAR_NAMES = ['Ada', 'Bea', 'Cam', 'Dee', 'Eli', 'Fay', 'Gia', 'Hal'];
const AVATARS = AVATAR_NAMES.map((name) => (
  <Avatar key={name} name={name} role="img" aria-label={name} />
));

const AvatarGroupExample = () => {
  const [names, setNames] = useState(AVATAR_NAMES.slice(0, 4));
  const [maxVisible, setMaxVisible] = useState(3);
  const [total, setTotal] = useState(4);
  const [rootActivations, setRootActivations] = useState(0);
  const [buttonActivations, setButtonActivations] = useState(0);
  const [linkActivations, setLinkActivations] = useState(0);

  return (
    <TwentyUiGalleryCard title="AvatarGroup overflow and composition">
      <AvatarGroup
        role="group"
        aria-label="Supplied avatars"
        avatars={AVATARS}
        maxVisible={3}
      />
      <AvatarGroup
        role="group"
        aria-label="Partially loaded avatars"
        avatars={AVATARS.slice(0, 3)}
        maxVisible={3}
        total={20}
      />
      <AvatarGroup
        role="group"
        aria-label="Custom overflow"
        avatars={AVATARS}
        maxVisible={3}
        renderOverflow={(hiddenCount) => (
          <Button aria-label={`Show ${hiddenCount} hidden people`}>
            {hiddenCount} more
          </Button>
        )}
      />
      <AvatarGroup
        role="group"
        aria-label="Stateful avatars"
        avatars={names.map((name) => (
          <StatefulGroupAvatar key={name} name={name} />
        ))}
        maxVisible={maxVisible}
        total={total}
      />
      <Button onClick={() => setNames(['Bea', 'Ada', 'Cam', 'Dee'])}>
        Reorder avatars
      </Button>
      <Button onClick={() => setMaxVisible(2)}>Show two avatars</Button>
      <Button onClick={() => setTotal(20)}>Load total</Button>
      <Button onClick={() => setMaxVisible(4)}>Show four avatars</Button>
      <AvatarGroup
        id="native-avatar-group"
        role="group"
        aria-label="Native root"
        title="Native group title"
        className="custom-avatar-group"
        style={{ padding: 7 }}
        avatars={AVATARS.slice(0, 1)}
        onClick={() => setRootActivations((count) => count + 1)}
        ref={(element) => {
          if (isDefined(element)) {
            element.dataset.refTag = element.tagName;
          }
        }}
      />
      <AvatarGroup
        aria-label="Open avatar group"
        avatars={AVATARS.slice(0, 1)}
        render={<button type="button" data-composed="button" />}
        onClick={() => setButtonActivations((count) => count + 1)}
        ref={(element) => {
          if (isDefined(element)) {
            element.dataset.refTag = element.tagName;
          }
        }}
      />
      <AvatarGroup
        aria-label="Avatar group documentation"
        avatars={AVATARS.slice(0, 1)}
        render={(props) =>
          createElement('a', {
            ...props,
            href: 'https://twenty.com',
            target: '_blank',
            rel: 'noreferrer',
            'data-composed': 'link',
          })
        }
        onClick={() => setLinkActivations((count) => count + 1)}
        ref={(element) => {
          if (isDefined(element)) {
            element.dataset.refTag = element.tagName;
          }
        }}
      />
      <output aria-label="Native root activations">{rootActivations}</output>
      <output aria-label="Composed button activations">
        {buttonActivations}
      </output>
      <output aria-label="Composed link activations">{linkActivations}</output>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'dbd13618-edb6-48a6-b4ce-c5af12b8d834',
  name: 'twenty-ui-avatar-group',
  description: 'AvatarGroup derived counts, child identity and native roots',
  component: AvatarGroupExample,
});
