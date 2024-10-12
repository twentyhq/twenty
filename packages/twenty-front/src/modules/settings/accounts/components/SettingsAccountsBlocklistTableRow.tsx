import { IconX, MOBILE_VIEWPORT } from 'twenty-ui';

import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { formatToHumanReadableDate } from '~/utils/date-utils';
import styled from '@emotion/styled';

type SettingsAccountsBlocklistTableRowProps = {
  blocklistItem: BlocklistItem;
  onRemove: (id: string) => void;
};
const StyledTableRow = styled(TableRow)`
  grid-template-columns: 4fr;
  white-space: pre;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 3fr;
    width: 100%;
  }
`;

const StyledTableCell = styled(TableCell)`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const StyledDateCell = styled(TableCell)`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: 100%;
    position: relative;
  }
`;

const StyledIconCell = styled(TableCell)`
  text-align: right;
`;

const StyledScrollableTextContainer = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: 100%;
    overflow-x: auto;
    white-space: pre-line;
  }
`;
export const SettingsAccountsBlocklistTableRow = ({
  blocklistItem,
  onRemove,
}: SettingsAccountsBlocklistTableRowProps) => {
  return (
    <StyledTableRow key={blocklistItem.id}>
      <StyledTableCell>
        <StyledScrollableTextContainer>
          {blocklistItem.handle}
        </StyledScrollableTextContainer>
      </StyledTableCell>
      <StyledDateCell align={'right'}>
        {blocklistItem.createdAt
          ? formatToHumanReadableDate(blocklistItem.createdAt)
          : ''}
      </StyledDateCell>
      <StyledIconCell align="right">
        <IconButton
          onClick={() => {
            onRemove(blocklistItem.id);
          }}
          variant="tertiary"
          size="small"
          Icon={IconX}
        />
      </StyledIconCell>
    </StyledTableRow>
  );
};
