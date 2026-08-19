import { DragDropManager, Draggable } from '@dnd-kit/dom';
import { PointerSensor } from '@dnd-kit/react';

import { PointerSensorWithSourceGuard } from '@/ui/utilities/drag-and-drop/sensors/PointerSensorWithSourceGuard';

const INITIAL_COORDINATES = { x: 0, y: 0 };

class TestablePointerSensorWithSourceGuard extends PointerSensorWithSourceGuard {
  public wasCanceled = false;

  public startFromActivation(source: Draggable, event: PointerEvent): void {
    this.initialCoordinates = INITIAL_COORDINATES;
    this.handleStart(source, event);
  }

  protected handleCancel(event: Event): void {
    this.wasCanceled = true;
    super.handleCancel(event);
  }
}

class TestablePointerSensor extends PointerSensor {
  public startFromActivation(source: Draggable, event: PointerEvent): void {
    this.initialCoordinates = INITIAL_COORDINATES;
    this.handleStart(source, event);
  }
}

const createActivationEvent = () => new Event('pointermove') as PointerEvent;

describe('PointerSensorWithSourceGuard', () => {
  let manager: DragDropManager;

  beforeEach(() => {
    manager = new DragDropManager();
  });

  afterEach(() => {
    manager.destroy();
    jest.restoreAllMocks();
  });

  const createUnregisteredDraggable = () =>
    new Draggable(
      {
        id: 'pressed-draggable',
        element: document.createElement('div'),
        register: false,
      },
      manager,
    );

  it('documents that the base sensor throws when the pressed draggable is no longer registered', () => {
    const source = createUnregisteredDraggable();
    const sensor = new TestablePointerSensor(manager);

    expect(() =>
      sensor.startFromActivation(source, createActivationEvent()),
    ).toThrow('Cannot start a drag operation without a drag source');
  });

  it('should cancel the gesture when the pressed draggable is no longer registered', () => {
    const source = createUnregisteredDraggable();
    const sensor = new TestablePointerSensorWithSourceGuard(manager);

    expect(() =>
      sensor.startFromActivation(source, createActivationEvent()),
    ).not.toThrow();

    expect(sensor.wasCanceled).toBe(true);
    expect(manager.dragOperation.status.idle).toBe(true);
  });

  it('should start the drag when the pressed draggable is still registered', () => {
    const source = new Draggable(
      { id: 'pressed-draggable', element: document.createElement('div') },
      manager,
    );
    source.register();

    const sensor = new TestablePointerSensorWithSourceGuard(manager);

    // An already-aborted controller makes the base handleStart return before
    // pointer capture, which jsdom does not implement.
    const abortedController = new AbortController();
    abortedController.abort();
    const startSpy = jest
      .spyOn(manager.actions, 'start')
      .mockReturnValue(abortedController);

    sensor.startFromActivation(source, createActivationEvent());

    expect(sensor.wasCanceled).toBe(false);
    expect(startSpy).toHaveBeenCalledWith(expect.objectContaining({ source }));
  });
});
