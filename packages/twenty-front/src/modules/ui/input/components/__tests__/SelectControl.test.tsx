import { render, screen } from '@testing-library/react';
import { IconBolt } from 'twenty-ui/icon';

import { SelectControl } from '@/ui/input/components/SelectControl';

describe('SelectControl', () => {
  it('renders an icon and custom leading content together', () => {
    render(
      <SelectControl
        selectedOption={{
          label: 'Fast',
          value: 'fast',
          Icon: IconBolt,
          LeftComponent: <span aria-label="Fast mode indicator" />,
        }}
      />,
    );

    expect(screen.getByLabelText('Fast mode indicator')).toBeVisible();
    expect(screen.getByText('Fast')).toBeVisible();
  });

  it('renders custom leading content for the selected option', () => {
    render(
      <SelectControl
        selectedOption={{
          label: 'Fast',
          value: 'fast',
          LeftComponent: <span aria-label="Fast mode indicator" />,
        }}
      />,
    );

    expect(screen.getByLabelText('Fast mode indicator')).toBeVisible();
    expect(screen.getByText('Fast')).toBeVisible();
  });
});
