import styled from '@emotion/styled';

const StyledTbody = styled.tbody`
  &.first-columns-sticky {
    td:nth-of-type(1) {
      position: sticky;
      left: 0;
      z-index: 6;
      transition: 0.3s ease;
    }
    td:nth-of-type(2) {
      position: sticky;
      left: 11px;
      z-index: 6;
      transition: 0.3s ease;
    }
    tr:not(:last-child) td:nth-of-type(3) {
      // Last row is aggregate footer
      position: sticky;
      left: 43px;
      z-index: 6;
      transition: 0.3s ease;

      &:not(.disable-shadow)::after {
        content: '';
        position: absolute;
        top: -1px;
        height: calc(100% + 2px);
        width: 4px;
        right: 0px;
        box-shadow: ${({ theme }) => theme.boxShadow.light};
        clip-path: inset(0px -4px 0px 0px);
      }
    }
  }
`;

export const RecordTableBody = StyledTbody;
