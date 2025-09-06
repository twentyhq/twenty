import styled from '@emotion/styled';

import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledTbody = styled.tbody`
  // TODO: re-implement horizontal scroll here after table have been refactored to divs
  td:nth-of-type(1) {
    position: sticky;
    left: 0px;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  td:nth-of-type(2) {
    position: sticky;
    left: 16px;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  tr:not(:last-child) td:nth-of-type(3) {
    position: sticky;
    left: 49px;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  td:nth-of-type(3) {
    @media (max-width: ${MOBILE_VIEWPORT}px) {
      width: ${38}px;
      max-width: ${38}px;
    }
  }
`;

export const RecordTableBody = StyledTbody;
