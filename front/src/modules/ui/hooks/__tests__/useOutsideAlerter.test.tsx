import { useRef } from 'react';
import { act } from 'react-dom/test-utils';
import { fireEvent, render } from '@testing-library/react';

import { useOutsideAlerter } from '../useOutsideAlerter';
const onOutsideClick = jest.fn();

function TestComponent() {
  const buttonRef = useRef(null);
  useOutsideAlerter({ ref: buttonRef, callback: onOutsideClick });

  return (
    <div>
      <span>Outside</span>
      <button ref={buttonRef}>Inside</button>
    </div>
  );
}

test('useOutsideAlerter hook works properly', async () => {
  const { getByText } = render(<TestComponent />);
  const inside = getByText('Inside');
  const outside = getByText('Outside');
  await act(() => Promise.resolve());

  fireEvent.mouseDown(inside);
  expect(onOutsideClick).toHaveBeenCalledTimes(0);

  fireEvent.mouseDown(outside);
  expect(onOutsideClick).toHaveBeenCalledTimes(1);
});
