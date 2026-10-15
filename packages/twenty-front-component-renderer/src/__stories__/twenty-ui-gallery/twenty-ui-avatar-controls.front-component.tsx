import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { ThemeProvider } from 'twenty-ui/theme';
import 'twenty-ui/style.css';

import { ComponentGallery } from '../shared/front-components/component-gallery';

const AvatarControls = () => {
  const [activations, setActivations] = useState(0);
  const [linkActivations, setLinkActivations] = useState(0);
  const [presentationalActivations, setPresentationalActivations] = useState(0);
  const handleClick = () => setActivations((count) => count + 1);
  return (
    <ThemeProvider colorScheme="light">
      <ComponentGallery
        title="Avatar controls"
        entries={[
          {
            name: 'AvatarImage',
            node: (
              <Avatar
                src="data:image/png;base64,invalid"
                name="Image fallback"
                imageProps={{ alt: 'Portrait unavailable' }}
              />
            ),
          },
          {
            name: 'Avatar',
            node: (
              <>
                <Avatar
                  name="Jane"
                  aria-label="Open Jane"
                  render={<button type="button" onClick={handleClick} />}
                  ref={(element) => {
                    if (isDefined(element)) {
                      element.dataset.refTag = element.tagName;
                    }
                  }}
                  shape="circle"
                  size="xl"
                />
                <Avatar
                  name="Disabled avatar"
                  aria-label="Disabled avatar"
                  render={
                    <button type="button" disabled onClick={handleClick} />
                  }
                />
                <Avatar.Root
                  render={<a href="#avatar-profile" target="_self" />}
                  aria-label="View Jane profile"
                  onClick={() => setLinkActivations((count) => count + 1)}
                  ref={(element) => {
                    if (isDefined(element)) {
                      element.dataset.refTag = element.tagName;
                    }
                  }}
                >
                  <Avatar.Fallback
                    render={<strong />}
                    ref={(element) => {
                      if (isDefined(element)) {
                        element.dataset.refTag = element.tagName;
                      }
                    }}
                  >
                    Profile
                  </Avatar.Fallback>
                </Avatar.Root>
                <Avatar.Root
                  name="Presentational avatar"
                  data-testid="presentational-avatar"
                  onClick={() =>
                    setPresentationalActivations((count) => count + 1)
                  }
                  ref={(element) => {
                    if (isDefined(element)) {
                      element.dataset.refTag = element.tagName;
                    }
                  }}
                >
                  <Avatar.Fallback aria-hidden>P</Avatar.Fallback>
                </Avatar.Root>
                <Avatar
                  name="Acme"
                  shape="rounded-square"
                  variant="outline"
                  size="lg"
                />
              </>
            ),
          },
        ]}
      />
      <output aria-label="Activations">{activations}</output>
      <output aria-label="Link activations">{linkActivations}</output>
      <output aria-label="Presentational activations">
        {presentationalActivations}
      </output>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: '3216e89b-f4f5-45cd-afcd-0e8a4db46d05',
  name: 'twenty-ui-avatar-controls',
  description: 'Avatar APIs and interactions in the sandbox',
  component: AvatarControls,
});
