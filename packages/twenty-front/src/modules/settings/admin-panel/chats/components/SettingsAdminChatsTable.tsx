import { t } from '@lingui/core/macro';

import { SETTINGS_ADMIN_CHATS_TABLE_GRID } from '@/settings/admin-panel/chats/constants/SettingsAdminChatsTableGrid';
import { SETTINGS_ADMIN_CHATS_TABLE_ID } from '@/settings/admin-panel/chats/constants/SettingsAdminChatsTableId';
import { SettingsAdminChatsTableRow } from '@/settings/admin-panel/chats/components/SettingsAdminChatsTableRow';
import { type AdminChatThreadListItem } from '@/settings/admin-panel/chats/types/AdminChatThreadListItem';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { AdminChatThreadSortField } from '~/generated-admin/graphql';

type SettingsAdminChatsTableProps = {
  threads: AdminChatThreadListItem[];
  showOnboardingTag: boolean;
};

export const SettingsAdminChatsTable = ({
  threads,
  showOnboardingTag,
}: SettingsAdminChatsTableProps) => {
  return (
    <Table>
      <TableRow gridAutoColumns={SETTINGS_ADMIN_CHATS_TABLE_GRID}>
        <TableHeader>{t`Workspace`}</TableHeader>
        <TableHeader>{t`User`}</TableHeader>
        <TableHeader>{t`Title`}</TableHeader>
        <SortableTableHeader
          tableId={SETTINGS_ADMIN_CHATS_TABLE_ID}
          fieldName={AdminChatThreadSortField.MESSAGE_COUNT}
          label={t`Msgs`}
          align="right"
        />
        <TableHeader align="right">{t`Replies`}</TableHeader>
        <TableHeader>{t`Flags`}</TableHeader>
        <SortableTableHeader
          tableId={SETTINGS_ADMIN_CHATS_TABLE_ID}
          fieldName={AdminChatThreadSortField.CREATED_AT}
          label={t`Created`}
          align="right"
          initialSort={{
            fieldName: AdminChatThreadSortField.CREATED_AT,
            orderBy: 'DescNullsLast',
          }}
        />
      </TableRow>
      <TableBody>
        {threads.map((thread) => (
          <SettingsAdminChatsTableRow
            key={thread.id}
            thread={thread}
            showOnboardingTag={showOnboardingTag}
          />
        ))}
      </TableBody>
    </Table>
  );
};
