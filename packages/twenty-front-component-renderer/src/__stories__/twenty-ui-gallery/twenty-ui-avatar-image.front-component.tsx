import { type CSSProperties, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';
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
  const [loadingStatus, setLoadingStatus] = useState('idle');
  const [imageLoads, setImageLoads] = useState(0);
  const [isImageKeptMounted, setIsImageKeptMounted] = useState(false);
  const [isSourceSetOnly, setIsSourceSetOnly] = useState(false);

  return (
    <TwentyUiGalleryCard title="Avatar image loading">
      {isMounted && (
        <Avatar.Root
          aria-label="Profile avatar"
          size="xl"
          render={<button type="button" />}
          onClick={() => setActivations((count) => count + 1)}
          style={({ imageLoadingStatus }) =>
            ({
              '--avatar-image-status': imageLoadingStatus,
            }) as CSSProperties
          }
        >
          <Avatar.Image
            key={isImageKeptMounted ? 'in-place' : 'preloaded'}
            src={isSourceSetOnly ? undefined : source}
            srcSet={
              isSourceSetOnly
                ? `${AVATAR_IMAGE_FIXTURE.sourceSetSource} 1x`
                : undefined
            }
            sizes="40px"
            keepMounted={isImageKeptMounted}
            alt="Portrait of Jane"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            render={<img data-composed-image="" />}
            ref={(element) => {
              if (isDefined(element)) {
                element.dataset.refTag = element.tagName;
              }
            }}
            onLoadingStatusChange={setLoadingStatus}
            onLoad={() => setImageLoads((count) => count + 1)}
          />
          <Avatar.Fallback
            delay={100}
            render={<strong />}
            ref={(element) => {
              if (isDefined(element)) {
                element.dataset.refTag = element.tagName;
              }
            }}
          >
            IF
          </Avatar.Fallback>
        </Avatar.Root>
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
      <Button onClick={() => setIsImageKeptMounted((value) => !value)}>
        {isImageKeptMounted
          ? 'Preload avatar image'
          : 'Load avatar image in place'}
      </Button>
      <Button onClick={() => setIsSourceSetOnly((value) => !value)}>
        {isSourceSetOnly ? 'Use avatar source' : 'Use avatar source set'}
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
      <output aria-label="Avatar image loading status">{loadingStatus}</output>
      <output aria-label="Avatar image load events">{imageLoads}</output>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '5958c6c4-46d5-42cf-8328-2731f8196c39',
  name: 'twenty-ui-avatar-image',
  description: 'Avatar image loading, replacement, fallback, and cleanup',
  component: AvatarImageExample,
});
