import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconBox, IconTimelineEvent } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';

import { LOG_CONSOLE_ACTOR_FILTER_FIELD } from '@/log-console/constants/LogConsoleActorFilterField';
import { LOG_CONSOLE_RECORD_ACTIONS } from '@/log-console/constants/LogConsoleRecordActions';
import { type LogConsoleFilterField } from '@/log-console/types/LogConsoleFilterField';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';

const LOGGED_RECORD_CHANGE_EVENTS = [
  'Object Record Created',
  'Object Record Updated',
  'Object Record Deleted',
  'Object Record Restored',
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
                  tag: (
                    <Tag color={action.color} startIcon={<action.Icon />}>
                      {t(action.label)}
                    </Tag>
                  ),
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
