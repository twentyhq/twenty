import { useRef } from 'react';
import TableHeader from '../../components/table/table-header/TableHeader';
import { render, fireEvent } from '@testing-library/react';
import { useOutsideAlerter } from '../useOutsideAlerter';
import { act } from 'react-dom/test-utils';
const onOutsideClick = jest.fn();

function TestComponent() {
  const buttonRef = useRef(null);
  useOutsideAlerter(buttonRef, onOutsideClick);

  return (
    <div>
      <span>Outside</span>
      <button ref={buttonRef}>Inside</button>
    </div>
  );
}

export default TableHeader;

test('clicking the button toggles an answer on/off', async () => {
  const { getByText } = render(<TestComponent />);
  const inside = getByText('Inside');
  const outside = getByText('Outside');
  await act(() => Promise.resolve());

  fireEvent.mouseDown(inside);
  expect(onOutsideClick).toHaveBeenCalledTimes(0);

  fireEvent.mouseDown(outside);
  expect(onOutsideClick).toHaveBeenCalledTimes(1);
});
