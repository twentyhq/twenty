import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { INBOX_TABLE_GRID_TEMPLATE_COLUMNS } from '@/inbox/constants/InboxTableGridTemplateColumns';
import { InboxTableRow } from '@/inbox/components/InboxTableRow';
import { InboxListSkeletonLoader } from '@/inbox/components/InboxListSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { type InboxItem } from '~/generated/graphql';

const StyledLoadMoreButton = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
  padding: ${themeCssVariables.spacing[10]};
`;

type InboxTableProps = {
  loading: boolean;
  needsActionItems: InboxItem[];
  otherItems: InboxItem[];
  selectedInboxItemId: string | null;
  hasMoreItems: boolean;
  onInboxItemClick: (inboxItem: InboxItem) => void;
  onLoadMoreItems: () => void;
};

export const InboxTable = ({
  loading,
  needsActionItems,
  otherItems,
  selectedInboxItemId,
  hasMoreItems,
  onInboxItemClick,
  onLoadMoreItems,
}: InboxTableProps) => {
  const { t } = useLingui();

  const hasNeedsActionSection = needsActionItems.length > 0;

  if (needsActionItems.length === 0 && otherItems.length === 0) {
    return loading ? (
      <InboxListSkeletonLoader />
    ) : (
      <StyledEmptyState>{t`Nothing to do here`}</StyledEmptyState>
    );
  }

  const renderRows = (inboxItems: InboxItem[]) =>
    inboxItems.map((inboxItem) => (
      <InboxTableRow
        key={inboxItem.id}
        inboxItem={inboxItem}
        isSelected={selectedInboxItemId === inboxItem.id}
        onClick={() => onInboxItemClick(inboxItem)}
      />
    ));

  return (
    <Table>
      <TableRow gridTemplateColumns={INBOX_TABLE_GRID_TEMPLATE_COLUMNS}>
        <TableHeader />
        <TableHeader />
        <TableHeader>{t`Type`}</TableHeader>
        <TableHeader>{t`Title`}</TableHeader>
        <TableHeader>{t`Preview`}</TableHeader>
        <TableHeader align="right">{t`Updated`}</TableHeader>
      </TableRow>
      {hasNeedsActionSection ? (
        <>
          <TableSection title={t`Needs attention`}>
            {renderRows(needsActionItems)}
          </TableSection>
          {otherItems.length > 0 && (
            <TableSection title={t`Everything else`}>
              {renderRows(otherItems)}
            </TableSection>
          )}
        </>
      ) : (
        <TableBody>{renderRows(otherItems)}</TableBody>
      )}
      {hasMoreItems && isDefined(onLoadMoreItems) && (
        <StyledLoadMoreButton type="button" onClick={onLoadMoreItems}>
          {t`Load older`}
        </StyledLoadMoreButton>
      )}
    </Table>
  );
};
