import { userEvent, waitFor } from 'storybook/test';

import { expectElementToReceivePointer } from '@/__stories__/shared/test-utils/matchers/expectElementToReceivePointer';

export const clickElementOnceItReceivesPointer = async (
  element: Element,
): Promise<void> => {
  await waitFor(() => expectElementToReceivePointer(element));
  await userEvent.click(element);
};
