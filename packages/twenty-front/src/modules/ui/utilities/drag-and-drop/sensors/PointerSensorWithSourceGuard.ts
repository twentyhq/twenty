import { type Draggable } from '@dnd-kit/dom';
import { PointerSensor } from '@dnd-kit/react';

// A drag only activates once the pointer travels past the activation
// constraints, so a re-render can unregister the pressed draggable between
// pointerdown and activation: virtualized rows remounting under new sortable
// ids, a widget or tab remounting while a page loads. The base sensor then
// throws "Cannot start a drag operation without a drag source"; there is
// nothing left to drag, so the gesture is canceled instead.
export class PointerSensorWithSourceGuard extends PointerSensor {
  protected handleStart(source: Draggable, event: PointerEvent): void {
    if (!this.manager.registry.draggables.has(source.id)) {
      this.handleCancel(event);
      return;
    }

    super.handleStart(source, event);
  }
}
