import { createElement, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { ThemeProvider } from 'twenty-ui/theme';
import 'twenty-ui/style.css';

import { ComponentGallery } from '../shared/front-components/component-gallery';

const StatusControls = () => {
  const [activations, setActivations] = useState(0);
  const [defaultActivations, setDefaultActivations] = useState(0);
  const [linkActivations, setLinkActivations] = useState(0);
  const [loading, setLoading] = useState(true);
  const handleClick = () => setActivations((count) => count + 1);
  return (
    <ThemeProvider colorScheme="light">
      <ComponentGallery
        title="Status controls"
        entries={[
          {
            name: 'Status',
            node: (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <Status
                  color="green"
                  render={<button type="button" onClick={handleClick} />}
                  ref={(element) => {
                    if (isDefined(element)) {
                      element.dataset.refTarget = 'status-button';
                    }
                  }}
                >
                  Open status
                </Status>
                <Status
                  color="green"
                  render={
                    <button type="button" disabled onClick={handleClick} />
                  }
                >
                  Disabled status
                </Status>
                <Status
                  color="blue"
                  loading={loading}
                  title="Loading status indicator"
                >
                  Loading status
                </Status>
                <Status
                  color="purple"
                  title="Default status with handler"
                  onClick={() => setDefaultActivations((count) => count + 1)}
                  ref={(element) => {
                    if (isDefined(element)) {
                      element.dataset.refTarget = 'default-status';
                    }
                  }}
                >
                  Default status
                </Status>
                <Status
                  color="blue"
                  render={(props, state) =>
                    createElement('a', {
                      ...props,
                      href: '#status-documentation',
                      target: '_self',
                      'data-render-loading': state.loading,
                    })
                  }
                  onClick={() => setLinkActivations((count) => count + 1)}
                  ref={(element) => {
                    if (isDefined(element)) {
                      element.dataset.refTarget = 'status-link';
                    }
                  }}
                >
                  Status documentation
                </Status>
                <Status color="gray">
                  <a href="#status-records" target="_self">
                    Intentional status link
                  </a>
                </Status>
                <Status color="blue" loading aria-busy={false}>
                  Caller-owned busy state
                </Status>
              </div>
            ),
          },
        ]}
      />
      <output aria-label="Activations">{activations}</output>
      <output aria-label="Default status activations">
        {defaultActivations}
      </output>
      <output aria-label="Status link activations">{linkActivations}</output>
      <Button onClick={() => setLoading(!loading)}>
        Toggle status loading
      </Button>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: '5b533ab1-e117-4644-a22f-b00b095fd81e',
  name: 'twenty-ui-status-controls',
  description: 'Status APIs and interactions in the sandbox',
  component: StatusControls,
});
