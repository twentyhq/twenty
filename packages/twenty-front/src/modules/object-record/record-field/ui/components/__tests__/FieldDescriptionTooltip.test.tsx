import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

import { FieldDescriptionTooltip } from '@/object-record/record-field/ui/components/FieldDescriptionTooltip';
import { FieldDescriptionTooltipProvider } from '@/object-record/record-field/ui/components/FieldDescriptionTooltipProvider';

describe('FieldDescriptionTooltip', () => {
  it('uses its shared provider through a disabled tooltip', async () => {
    const user = userEvent.setup();

    render(
      <FieldDescriptionTooltipProvider>
        <Tooltip content="Inline field" disabled>
          <div>
            <FieldDescriptionTooltip
              label="Company"
              description="Legal company name"
            />
          </div>
        </Tooltip>
      </FieldDescriptionTooltipProvider>,
    );

    await user.tab();

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Legal company name',
    );
  });
});
