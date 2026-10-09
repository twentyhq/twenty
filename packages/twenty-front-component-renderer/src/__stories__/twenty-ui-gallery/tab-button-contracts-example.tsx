import { createElement, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { TabButton } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { ButtonGroup } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

export const TabButtonContractsExample = () => {
  const [routeClicks, setRouteClicks] = useState(0);
  const [actionClicks, setActionClicks] = useState(0);

  return (
    <>
      <nav aria-label="Account routes">
        <TabButton
          active
          aria-current="page"
          nativeButton={false}
          role="link"
          href="#account-route"
          target="_self"
          title="Current account route"
          render={
            <a
              ref={(element) => {
                if (!isDefined(element)) {
                  return;
                }
                element.setAttribute('data-render-ref-target', 'route-link');
              }}
            />
          }
          ref={(element) => {
            if (!isDefined(element)) {
              return;
            }
            element.setAttribute('data-ref-target', 'route-link');
          }}
          onClick={(event) => {
            event.preventDefault();
            setRouteClicks((count) => count + 1);
          }}
        >
          Account route
        </TabButton>
        <TabButton
          nativeButton={false}
          role="link"
          href="#activity-route"
          target="_self"
          render={(props, state) =>
            createElement('a', {
              ...props,
              'data-render-disabled': String(state.disabled),
            })
          }
          ref={(element) => {
            if (!isDefined(element)) {
              return;
            }
            element.setAttribute('data-ref-target', 'callback-route-link');
          }}
          onClick={(event) => {
            event.preventDefault();
            setRouteClicks((count) => count + 1);
          }}
        >
          Activity route
        </TabButton>
        <TabButton
          href="#disabled-route"
          target="_self"
          disabled
          onClick={(event) => {
            event.preventDefault();
            setRouteClicks((count) => count + 1);
          }}
        >
          Disabled route
        </TabButton>
      </nav>
      <ButtonGroup aria-label="Adjacent tab actions" size="md">
        <TabButton
          nativeButton
          href="#native-action"
          render={<button />}
          startIcon={<IconPlus />}
          ref={(element) => {
            if (!isDefined(element)) {
              return;
            }
            element.setAttribute('data-ref-target', 'tab-action');
          }}
          onClick={() => setActionClicks((count) => count + 1)}
        >
          Create related panel
        </TabButton>
        <TabButton size="sm">More actions</TabButton>
      </ButtonGroup>
      <Text aria-label="Route activations">{routeClicks}</Text>
      <Text aria-label="Adjacent action activations">{actionClicks}</Text>
    </>
  );
};
