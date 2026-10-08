import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { colorSampleTest } from '@/__stories__/twenty-ui-gallery/utils/colorSampleTest';

export const commandBlockTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  await colorSampleTest(context);
  const canvas = within(context.canvasElement);
  const root = canvas.getByRole('region', { name: 'Application commands' });
  await waitFor(() =>
    expect(root).toHaveAttribute('data-ref-tag', 'HTML-SECTION'),
  );
  await expect(root).toHaveClass('custom-commands');
  await expect(root).toHaveStyle({ marginTop: '7px' });
  const commands = within(root);
  const code = commands.getByRole('code');
  await expect(code.parentElement?.tagName).toBe('PRE');
  await expect(code.textContent).toBe('> echo "<hello>"\n> npm run start');
  await expect(
    commands.getByRole('link', { name: 'Read instructions' }),
  ).toHaveAttribute('href', '#instructions');
  await userEvent.click(
    commands.getByRole('button', { name: 'Copy commands' }),
  );
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByLabelText('Command copies')).toHaveTextContent('2'),
  );
  await waitFor(() =>
    expect(canvas.getByLabelText('Command clicks')).toHaveTextContent('2'),
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Composed action' }),
  );
  await waitFor(() =>
    expect(canvas.getByLabelText('Command clicks')).toHaveTextContent('3'),
  );
  await waitFor(() =>
    expect(canvas.getByLabelText('Command render clicks')).toHaveTextContent(
      '1',
    ),
  );
};
