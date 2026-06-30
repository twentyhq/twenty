import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  > [data-table-row]:first-child:not(:has([data-table-header])),
  > [data-table-row]:has([data-table-header])
    + [data-table-row]:not(:has([data-table-header])) {
    margin-top: ${themeCssVariables.spacing[2]};
  }

  > [data-table-row]:last-child:not(:has([data-table-header])) {
    margin-bottom: ${themeCssVariables.spacing[2]};
  }
`;

export { StyledTable as Table };
