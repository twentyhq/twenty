import { render } from '@testing-library/react';

import { DiscussionPanelDefault } from '../__stories__/DiscussionPanel.stories';

it('Checks the discussion panel render', () => {
  const { getAllByText } = render(<DiscussionPanelDefault />);

  const text = getAllByText('Rochefort Montagne');
  expect(text).toBeDefined();
});
