import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type ApplicationMonitoringEvent } from 'twenty-shared/application';
import {
  IconDownload,
  IconRefresh,
  IconTrash,
  IconApi,
  IconWebhook,
  type IconComponent,
} from 'twenty-ui/icon';

export const LOG_CONSOLE_APPLICATION_EVENTS: Record<
  ApplicationMonitoringEvent,
  { label: MessageDescriptor; Icon: IconComponent }
> = {
  'application.install.succeeded': {
    label: msg`Install succeeded`,
    Icon: IconDownload,
  },
  'application.install.failed': {
    label: msg`Install failed`,
    Icon: IconDownload,
  },
  'application.upgrade.succeeded': {
    label: msg`Upgrade succeeded`,
    Icon: IconRefresh,
  },
  'application.upgrade.failed': {
    label: msg`Upgrade failed`,
    Icon: IconRefresh,
  },
  'application.uninstall.succeeded': {
    label: msg`Uninstall succeeded`,
    Icon: IconTrash,
  },
  'application.uninstall.failed': {
    label: msg`Uninstall failed`,
    Icon: IconTrash,
  },
  'application.api.rate_limited': { label: msg`API throttling`, Icon: IconApi },
  'application.server_route.unreachable': {
    label: msg`Server route unavailable`,
    Icon: IconWebhook,
  },
};
