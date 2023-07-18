import { useRef } from 'react';
import { fireEvent, render } from '@testing-library/react';

import { useListenClickOutsideArrayOfRef } from '../useListenClickOutsideArrayOfRef';

const onOutsideClick = jest.fn();

function TestComponentDomMode() {
  const buttonRef = useRef(null);
  const buttonRef2 = useRef(null);
  useListenClickOutsideArrayOfRef({
    refs: [buttonRef, buttonRef2],
    callback: onOutsideClick,
  });

  return (
    <div>
      <span>Outside</span>
      <button ref={buttonRef}>Inside</button>
      <button ref={buttonRef2}>Inside 2</button>
    </div>
  );
}

test('useListenClickOutsideArrayOfRef hook works in dom mode', async () => {
  const { getByText } = render(<TestComponentDomMode />);
  const inside = getByText('Inside');
  const inside2 = getByText('Inside 2');
  const outside = getByText('Outside');

  fireEvent.click(inside);
  expect(onOutsideClick).toHaveBeenCalledTimes(0);

  fireEvent.click(inside2);
  expect(onOutsideClick).toHaveBeenCalledTimes(0);

  fireEvent.click(outside);
  expect(onOutsideClick).toHaveBeenCalledTimes(1);
});
