import { createElement, type MouseEvent, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { SettingsRow } from 'twenty-ui/components/settings';
import { IconBell } from 'twenty-ui/icon';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const SettingsRowExample = () => {
  const [notifications, setNotifications] = useState(false);
  const [changes, setChanges] = useState(0);
  const [changeEvent, setChangeEvent] = useState('none');
  const [labelEvent, setLabelEvent] = useState('none');
  const [controlEvent, setControlEvent] = useState('none');
  const [cancelledChanges, setCancelledChanges] = useState(0);
  const [cancelledEvent, setCancelledEvent] = useState('none');

  return (
    <TwentyUiGalleryCard title="SettingsRow">
      <SettingsRow
        id="notifications-control"
        title="Switch control"
        name="notifications"
        value="enabled"
        uncheckedValue="disabled"
        checked={notifications}
        nativeButton
        ref={(element) => {
          element?.setAttribute('data-ref-target', 'control');
        }}
        inputRef={(element) => {
          element?.setAttribute('data-ref-target', 'input');
        }}
        render={(props, state) =>
          createElement('button', {
            ...props,
            'data-active': String(state.checked),
          })
        }
        onClick={(event) => {
          setControlEvent(`${event.currentTarget.tagName}/${event.type}`);
        }}
        onCheckedChange={(checked, details) => {
          setNotifications(checked);
          setChanges((count) => count + 1);
          setChangeEvent(`${details.event.type}/${typeof details.cancel}`);
        }}
        labelRef={(element) => {
          element?.setAttribute('data-ref-target', 'label');
        }}
        labelRender={(props) =>
          createElement(
            'label',
            {
              ...props,
              id: 'notifications-row',
              title: 'Native label',
              'data-testid': 'notifications-row',
              'data-label-render': 'true',
              onClick: (event: MouseEvent<HTMLLabelElement>) => {
                props.onClick?.(event);
                setLabelEvent(`${event.currentTarget.tagName}/${event.type}`);
              },
            },
            createElement(
              'span',
              { style: { display: 'contents' } },
              props.children,
            ),
          )
        }
        startElement={
          <span data-testid="notifications-start">
            <IconBell aria-hidden />
            Email
          </span>
        }
        description={
          <span>
            Updates <strong>by email</strong>
          </span>
        }
      >
        Notifications
      </SettingsRow>
      <SettingsRow
        disabled
        onCheckedChange={() => setChanges((count) => count + 1)}
      >
        Disabled notifications
      </SettingsRow>
      <SettingsRow defaultChecked>Uncontrolled notifications</SettingsRow>
      <SettingsRow
        defaultChecked
        readOnly
        onCheckedChange={() => setChanges((count) => count + 1)}
      >
        Read-only notifications
      </SettingsRow>
      <SettingsRow
        onCheckedChange={(_checked, details) => {
          details.cancel();
          setCancelledChanges((count) => count + 1);
          setCancelledEvent(details.event.type);
        }}
      >
        Cancelled notifications
      </SettingsRow>
      <p role="status">
        Notifications: {notifications ? 'enabled' : 'disabled'}; Changes:{' '}
        {changes}; Event: {changeEvent}
      </p>
      <p aria-label="Native label event">{labelEvent}</p>
      <p aria-label="Switch control event">{controlEvent}</p>
      <p aria-label="Cancelled changes">
        {cancelledChanges}/{cancelledEvent}
      </p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '68a0e63b-fd20-4515-a733-96f457ceba71',
  name: 'twenty-ui-settings-row',
  description: 'SettingsRow label and Switch control contracts in the sandbox',
  component: SettingsRowExample,
});
