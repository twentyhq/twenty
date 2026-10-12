import { createElement, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { DirectionProvider } from 'twenty-ui/primitives/layout';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';

export const TabsContractsExample = () => {
  const [value, setValue] = useState('overview');
  const [changeCount, setChangeCount] = useState(0);
  const [changeDetails, setChangeDetails] = useState('none');
  const [nativeKey, setNativeKey] = useState('none');
  const [automaticValue, setAutomaticValue] = useState('first');
  const [automaticDetails, setAutomaticDetails] = useState('none');

  return (
    <>
      <Tabs.Root
        value={value}
        onValueChange={(nextValue, details) => {
          setValue(nextValue);
          setChangeCount((count) => count + 1);
          setChangeDetails(
            `${nextValue}:${details.reason}:${details.event.type}:${details.activationDirection}`,
          );
        }}
        render={<section />}
        data-testid="controlled-tabs-root"
        title="Controlled account panels"
        ref={(element) => {
          if (!isDefined(element)) {
            return;
          }
          element.setAttribute('data-ref-target', 'tabs-root');
        }}
      >
        <Tabs.List
          aria-label="Account sections"
          render={<nav />}
          onKeyDown={(event) => setNativeKey(event.key)}
          ref={(element) => {
            if (!isDefined(element)) {
              return;
            }
            element.setAttribute('data-ref-target', 'tabs-list');
          }}
        >
          <Tabs.Tab
            value="overview"
            id="account-overview-tab"
            aria-controls="account-overview-panel"
            render={<button data-native-owner="overview" />}
            nativeButton
            ref={(element) => {
              if (!isDefined(element)) {
                return;
              }
              element.setAttribute('data-ref-target', 'tabs-tab');
            }}
          >
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="disabled" disabled>
            Unavailable
          </Tabs.Tab>
          <Tabs.Tab
            value="activity"
            id="account-activity-tab"
            aria-controls="account-activity-panel"
          >
            Activity
          </Tabs.Tab>
          <Tabs.Indicator
            data-testid="account-indicator"
            render={(props, state) =>
              createElement('span', {
                ...props,
                'data-render-orientation': state.orientation,
              })
            }
            ref={(element) => {
              if (!isDefined(element)) {
                return;
              }
              element.setAttribute('data-ref-target', 'tabs-indicator');
            }}
          />
        </Tabs.List>
        <Tabs.Panel
          value="overview"
          id="account-overview-panel"
          keepMounted
          render={<article />}
          ref={(element) => {
            if (!isDefined(element)) {
              return;
            }
            element.setAttribute('data-ref-target', 'tabs-panel');
          }}
        >
          Account overview
        </Tabs.Panel>
        <Tabs.Panel
          value="activity"
          id="account-activity-panel"
          keepMounted
          render={(props, state) =>
            createElement('article', {
              ...props,
              'data-render-hidden': String(state.hidden),
            })
          }
        >
          Recent activity
        </Tabs.Panel>
      </Tabs.Root>
      <Text aria-label="Controlled selection">{value}</Text>
      <Text aria-label="Controlled change count">{changeCount}</Text>
      <Text aria-label="Controlled change details">{changeDetails}</Text>
      <Text aria-label="Tabs native key">{nativeKey}</Text>
      <Button onClick={() => setValue('overview')}>
        Select overview externally
      </Button>
      <Tabs.Root
        defaultValue="first"
        orientation="vertical"
        onValueChange={(nextValue, details) => {
          if (nextValue === 'blocked') {
            details.cancel();
          }
          setAutomaticDetails(
            `${nextValue}:${details.reason}:${details.event.type}:${details.isCanceled}`,
          );
          if (details.isCanceled) {
            return;
          }
          setAutomaticValue(nextValue);
        }}
      >
        <Tabs.List
          aria-label="Automatic vertical sections"
          activateOnFocus
          loopFocus={false}
        >
          <Tabs.Tab value="disabled-first" disabled>
            Disabled first
          </Tabs.Tab>
          <Tabs.Tab value="first">First section</Tabs.Tab>
          <Tabs.Tab value="disabled-middle" disabled>
            Disabled middle
          </Tabs.Tab>
          <Tabs.Tab value="second">Second section</Tabs.Tab>
          <Tabs.Tab value="blocked">Blocked section</Tabs.Tab>
          <Tabs.Tab value="disabled-last" disabled>
            Disabled last
          </Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="first">First section content</Tabs.Panel>
        <Tabs.Panel value="second">Second section content</Tabs.Panel>
        <Tabs.Panel value="blocked">Blocked section content</Tabs.Panel>
      </Tabs.Root>
      <Text aria-label="Automatic selection">{automaticValue}</Text>
      <Text aria-label="Automatic change details">{automaticDetails}</Text>
      <DirectionProvider direction="rtl">
        <Tabs.Root defaultValue="start" dir="rtl">
          <Tabs.List aria-label="RTL sections" activateOnFocus>
            <Tabs.Tab value="start">RTL start</Tabs.Tab>
            <Tabs.Tab value="disabled" disabled>
              RTL unavailable
            </Tabs.Tab>
            <Tabs.Tab value="end">RTL end</Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Panel value="start">RTL start content</Tabs.Panel>
          <Tabs.Panel value="end">RTL end content</Tabs.Panel>
        </Tabs.Root>
      </DirectionProvider>
    </>
  );
};
