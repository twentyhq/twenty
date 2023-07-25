import { Decorator } from '@storybook/react';

import { RecoilScope } from '../../modules/ui/recoil-scope/components/RecoilScope';
import { CellContext } from '../../modules/ui/table/states/CellContext';
import { RowContext } from '../../modules/ui/table/states/RowContext';

export const CellPositionDecorator: Decorator = (Story) => (
  <RecoilScope SpecificContext={RowContext}>
    <RecoilScope SpecificContext={CellContext}>
      <Story />
    </RecoilScope>
  </RecoilScope>
);
