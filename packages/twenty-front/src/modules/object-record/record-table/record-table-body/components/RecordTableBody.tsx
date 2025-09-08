import styled from '@emotion/styled';

import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledTbody = styled.div`
  // TODO: re-implement horizontal scroll here after table have been refactored to divs
  div.table-cell:nth-of-type(1) {
    position: sticky;
    left: 0px;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  div.table-cell:nth-of-type(2) {
    position: sticky;
    left: 16px;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  div.table-cell:nth-of-type(3) {
    position: sticky;
    left: 48px;
    z-index: ${TABLE_Z_INDEX.cell.sticky};

    @media (max-width: ${MOBILE_VIEWPORT}px) {
      width: ${38}px;
      max-width: ${38}px;
    }
  }

  display: flex;
  flex-wrap: wrap;
`;

export const RecordTableBody = StyledTbody;
