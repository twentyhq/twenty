import { Decorator } from '@storybook/react';

import { ColumnIndexContext } from '../../modules/ui/table/contexts/ColumnIndexContext';
import { RowIndexContext } from '../../modules/ui/table/contexts/RowIndexContext';

export const CellPositionDecorator: Decorator = (Story) => (
  <RowIndexContext.Provider value={1}>
    <ColumnIndexContext.Provider value={1}>
      <Story />
    </ColumnIndexContext.Provider>
  </RowIndexContext.Provider>
);
