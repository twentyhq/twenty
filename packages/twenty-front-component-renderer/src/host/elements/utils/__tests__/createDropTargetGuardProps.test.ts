import { createDropTargetGuardProps } from '../createDropTargetGuardProps';

describe('createDropTargetGuardProps', () => {
  it('should return undefined without drag over or drop handlers', () => {
    expect(createDropTargetGuardProps({ onClick: jest.fn() })).toBeUndefined();
  });

  it('should prevent default on drag over and forward to the remote handler', () => {
    const onDragOver = jest.fn();
    const props = createDropTargetGuardProps({ onDragOver });
    const event = { preventDefault: jest.fn() };

    (props?.onDragOver as (event: unknown) => void)(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(onDragOver).toHaveBeenCalledWith(event);
  });

  it('should prevent default on drag over when only a drop handler exists', () => {
    const onDrop = jest.fn();
    const props = createDropTargetGuardProps({ onDrop });
    const dragOverEvent = { preventDefault: jest.fn() };
    const dropEvent = { preventDefault: jest.fn() };

    (props?.onDragOver as (event: unknown) => void)(dragOverEvent);
    (props?.onDrop as (event: unknown) => void)(dropEvent);

    expect(dragOverEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(dropEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith(dropEvent);
  });

  it('should prevent default without forwarding to a non-function handler', () => {
    const props = createDropTargetGuardProps({
      onDragOver: 'alert(1)',
      onDrop: jest.fn(),
    });
    const event = { preventDefault: jest.fn() };

    (props?.onDragOver as (event: unknown) => void)(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });
});
