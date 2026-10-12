import { type Draggable } from '@dnd-kit/dom';
import { PointerSensor } from '@dnd-kit/react';

// A re-render can unregister the pressed draggable before activation, which makes the base sensor throw
export class PointerSensorWithSourceGuard extends PointerSensor {
  protected handleStart(source: Draggable, event: PointerEvent): void {
    if (!this.manager.registry.draggables.has(source.id)) {
      this.handleCancel(event);
      return;
    }

    super.handleStart(source, event);
  }
}
