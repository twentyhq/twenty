import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { IconStar } from 'twenty-ui/icon';
import { ThemeProvider } from 'twenty-ui/theme';
import 'twenty-ui/style.css';

import { ComponentGallery } from '../shared/front-components/component-gallery';

const TagControls = () => {
  const [activations, setActivations] = useState(0);
  const [defaultActivations, setDefaultActivations] = useState(0);
  const [linkActivations, setLinkActivations] = useState(0);
  const [focuses, setFocuses] = useState(0);
  const handleClick = () => setActivations((count) => count + 1);
  return (
    <ThemeProvider colorScheme="light">
      <ComponentGallery
        title="Tag controls"
        entries={[
          {
            name: 'Tag',
            node: (
              <>
                <Tag
                  color="blue"
                  onClick={handleClick}
                  onFocus={() => setFocuses((count) => count + 1)}
                  startIcon={<IconStar />}
                  ref={(element) => {
                    if (isDefined(element)) {
                      element.dataset.refTarget = 'tag-button';
                    }
                  }}
                  render={
                    <button
                      type="button"
                      ref={(element) => {
                        if (isDefined(element)) {
                          element.dataset.renderRefTarget = 'tag-button';
                        }
                      }}
                    />
                  }
                >
                  Open tag
                </Tag>
                <Tag
                  color="blue"
                  render={
                    <button type="button" disabled onClick={handleClick} />
                  }
                >
                  Disabled tag
                </Tag>
                <Tag color="green" variant="outline">
                  Static tag
                </Tag>
                <Tag
                  color="purple"
                  title="Default tag with handler"
                  onClick={() => setDefaultActivations((count) => count + 1)}
                  ref={(element) => {
                    if (isDefined(element)) {
                      element.dataset.refTarget = 'default-tag';
                    }
                  }}
                >
                  Default tag
                </Tag>
                <Tag
                  color="blue"
                  render={
                    <a
                      href="#tag-documentation"
                      target="_self"
                      onClick={() => setLinkActivations((count) => count + 1)}
                      ref={(element) => {
                        if (isDefined(element)) {
                          element.dataset.renderRefTarget = 'tag-link';
                        }
                      }}
                    />
                  }
                  ref={(element) => {
                    if (isDefined(element)) {
                      element.dataset.refTarget = 'tag-link';
                    }
                  }}
                >
                  Tag documentation
                </Tag>
                <Tag color="gray" truncate={false} style={{ padding: 0 }}>
                  <a href="#tag-records" target="_self">
                    Intentional tag link
                  </a>
                </Tag>
                <Tag color="blue" title="Truncated tag" style={{ width: 100 }}>
                  A long tag label that should truncate
                </Tag>
                <Tag
                  color="blue"
                  title="Full tag"
                  truncate={false}
                  style={{ minWidth: 'fit-content' }}
                >
                  A long tag label shown in full
                </Tag>
              </>
            ),
          },
        ]}
      />
      <output aria-label="Activations">{activations}</output>
      <output aria-label="Default tag activations">{defaultActivations}</output>
      <output aria-label="Tag link activations">{linkActivations}</output>
      <output aria-label="Tag focuses">{focuses}</output>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'ce24297f-b8c4-4e55-85d2-032c21c9b85f',
  name: 'twenty-ui-tag-controls',
  description: 'Tag APIs and interactions in the sandbox',
  component: TagControls,
});
