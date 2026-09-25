import { msg } from '@lingui/core/macro';
import { IconUsers } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { type LogConsoleFilterField } from '@/log-console/types/LogConsoleFilterField';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const LOG_CONSOLE_ACTOR_FILTER_FIELD: LogConsoleFilterField = {
  id: 'actor',
  label: msg`Actor`,
  Icon: IconUsers,
  serverField: 'userId',
  getOptions: ({ workspaceMembers }) =>
    workspaceMembers.map((workspaceMember) => {
      const name = `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`;

      return {
        label: name,
        values: [workspaceMember.userId],
        startIcon: (
          <Avatar
            src={getAbsoluteImageUrl(workspaceMember.avatarUrl)}
            name={name}
            colorSeed={workspaceMember.id}
            shape="circle"
            size="md"
          />
        ),
      };
    }),
};
