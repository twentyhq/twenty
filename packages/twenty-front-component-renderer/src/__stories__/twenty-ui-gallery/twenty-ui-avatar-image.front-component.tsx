import { type CSSProperties, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Button, Input } from 'twenty-ui/primitives/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';
import { AVATAR_IMAGE_FIXTURE } from '@/__stories__/twenty-ui-gallery/constants/AvatarImageFixture';

const AvatarImageExample = () => {
  const [source, setSource] = useState<string>(
    AVATAR_IMAGE_FIXTURE.firstSource,
  );
  const [customSource, setCustomSource] = useState('');
  const [isMounted, setIsMounted] = useState(true);
  const [activations, setActivations] = useState(0);

  return (
    <TwentyUiGalleryCard title="Avatar image loading">
      {isMounted && (
        <Avatar
          src={source}
          name="Image fallback"
          aria-label="Profile avatar"
          size="xl"
          onClick={() => setActivations((count) => count + 1)}
          style={({ imageLoadingStatus }) =>
            ({
              '--avatar-image-status': imageLoadingStatus,
            }) as CSSProperties
          }
        />
      )}
      <Button onClick={() => setSource(AVATAR_IMAGE_FIXTURE.firstSource)}>
        Restore avatar image
      </Button>
      <Button onClick={() => setSource(AVATAR_IMAGE_FIXTURE.replacementSource)}>
        Replace avatar image
      </Button>
      <Button onClick={() => setSource(AVATAR_IMAGE_FIXTURE.brokenSource)}>
        Break avatar image
      </Button>
      <Input
        aria-label="Avatar image source"
        value={customSource}
        onValueChange={setCustomSource}
      />
      <Button onClick={() => setSource(customSource)}>
        Apply avatar source
      </Button>
      <Button onClick={() => setIsMounted((value) => !value)}>
        {isMounted ? 'Remove avatar' : 'Mount avatar'}
      </Button>
      <output aria-label="Avatar activations">{activations}</output>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '5958c6c4-46d5-42cf-8328-2731f8196c39',
  name: 'twenty-ui-avatar-image',
  description: 'Avatar image loading, replacement, fallback, and cleanup',
  component: AvatarImageExample,
});
