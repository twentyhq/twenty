import { isClickFromPointerDown } from '@/ui/field/input/utils/isClickFromPointerDown';

describe('isClickFromPointerDown', () => {
  const createRow = () => {
    const row = document.createElement('div');
    const firstCell = document.createElement('span');
    const secondCell = document.createElement('span');

    row.append(firstCell, secondCell);
    document.body.append(row);

    return { row, firstCell, secondCell };
  };

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('matches a click on the pressed element', () => {
    const { firstCell } = createRow();

    expect(
      isClickFromPointerDown({
        clickTarget: firstCell,
        pointerDownTarget: firstCell,
      }),
    ).toBe(true);
  });

  it('matches a click retargeted to the common ancestor after a drag', () => {
    const { row, firstCell } = createRow();

    expect(
      isClickFromPointerDown({
        clickTarget: row,
        pointerDownTarget: firstCell,
      }),
    ).toBe(true);
  });

  it('matches a click when the pressed element was re-rendered', () => {
    const { secondCell, firstCell } = createRow();

    firstCell.remove();

    expect(
      isClickFromPointerDown({
        clickTarget: secondCell,
        pointerDownTarget: firstCell,
      }),
    ).toBe(true);
  });

  it('ignores a click that started elsewhere', () => {
    const { firstCell, secondCell } = createRow();

    expect(
      isClickFromPointerDown({
        clickTarget: secondCell,
        pointerDownTarget: firstCell,
      }),
    ).toBe(false);
  });

  it('ignores a click without a recorded pointer down', () => {
    const { firstCell } = createRow();

    expect(
      isClickFromPointerDown({
        clickTarget: firstCell,
        pointerDownTarget: null,
      }),
    ).toBe(false);
  });
});
