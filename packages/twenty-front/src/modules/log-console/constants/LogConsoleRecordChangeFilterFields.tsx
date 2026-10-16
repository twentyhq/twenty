import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconBox, IconTimelineEvent } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';

import { LOG_CONSOLE_ACTOR_FILTER_FIELD } from '@/log-console/constants/LogConsoleActorFilterField';
import { LOG_CONSOLE_RECORD_ACTIONS } from '@/log-console/constants/LogConsoleRecordActions';
import { type LogConsoleFilterField } from '@/log-console/types/LogConsoleFilterField';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';

const LOGGED_RECORD_CHANGE_EVENTS = [
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- These exact event names are sent to the log filter API.
  'Object Record Created',
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- These exact event names are sent to the log filter API.
  'Object Record Updated',
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- These exact event names are sent to the log filter API.
  'Object Record Upserted',
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- These exact event names are sent to the log filter API.
  'Object Record Deleted',
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- These exact event names are sent to the log filter API.
  'Object Record Restored',
  // oxlint-disable-next-line lingui/no-unlocalized-strings -- These exact event names are sent to the log filter API.
  'Object Record Destroyed',
];

export const LOG_CONSOLE_RECORD_CHANGE_FILTER_FIELDS: LogConsoleFilterField[] =
  [
    {
      id: 'action',
      label: msg`Action`,
      Icon: IconTimelineEvent,
      serverField: 'event',
      getOptions: () =>
        LOGGED_RECORD_CHANGE_EVENTS.flatMap((event) => {
          const action = LOG_CONSOLE_RECORD_ACTIONS[event];

          return isDefined(action)
            ? [
                {
                  label: t(action.label),
                  values: [event],
                  tag: <Status color={action.color}>{t(action.label)}</Status>,
                },
              ]
            : [];
        }),
    },
    {
      id: 'object',
      label: msg`Object`,
      Icon: IconBox,
      serverField: 'objectMetadataId',
      getOptions: ({ activeObjectMetadataItems }) =>
        activeObjectMetadataItems.map((objectMetadataItem) => ({
          label: objectMetadataItem.labelPlural,
          values: [objectMetadataItem.id],
          startIcon: (
            <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
          ),
        })),
    },
    LOG_CONSOLE_ACTOR_FILTER_FIELD,
  ];
