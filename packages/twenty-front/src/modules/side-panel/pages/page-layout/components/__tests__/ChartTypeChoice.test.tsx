import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { IconChartBar, IconChartPie } from 'twenty-ui/icon';
import { ChartTypeChoice } from '@/side-panel/pages/page-layout/components/ChartTypeChoice';

const ChartChoices = () => {
  const [chartType, setChartType] = useState('bar');
  return (
    <>
      <ChartTypeChoice
        icon={IconChartBar}
        label="Bar chart"
        selected={chartType === 'bar'}
        onClick={() => setChartType('bar')}
      />
      <ChartTypeChoice
        icon={IconChartPie}
        label="Pie chart"
        selected={chartType === 'pie'}
        onClick={() => setChartType('pie')}
      />
    </>
  );
};

it('exposes chart names and updates selection with pointer and keyboard activation', async () => {
  const user = userEvent.setup();
  render(<ChartChoices />);
  const bar = screen.getByRole('button', { name: 'Bar chart' });
  const pie = screen.getByRole('button', { name: 'Pie chart' });
  expect(bar).toHaveAttribute('aria-pressed', 'true');
  await user.click(pie);
  expect(pie).toHaveAttribute('aria-pressed', 'true');
  expect(bar).toHaveAttribute('aria-pressed', 'false');
  await user.tab({ shift: true });
  await user.keyboard('{Enter}');
  expect(bar).toHaveAttribute('aria-pressed', 'true');
  await user.tab();
  await user.keyboard(' ');
  expect(pie).toHaveAttribute('aria-pressed', 'true');
});

it('keeps an unavailable chart inactive and does not submit its form', async () => {
  const user = userEvent.setup();
  const onClick = jest.fn();
  const onSubmit = jest.fn((event) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <ChartTypeChoice
        icon={IconChartPie}
        label="Pie chart"
        selected={false}
        disabled
        onClick={onClick}
      />
      <ChartTypeChoice
        icon={IconChartBar}
        label="Bar chart"
        selected
        onClick={onClick}
      />
    </form>,
  );
  await user.click(screen.getByRole('button', { name: 'Pie chart' }));
  expect(onClick).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Bar chart' }));
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(onSubmit).not.toHaveBeenCalled();
});
