/**
 * OperationTracker manages generation-based operation tracking to solve race conditions
 * in the dev mode orchestrator.
 *
 * Key concepts:
 * - A "generation" represents a single build cycle triggered by file changes
 * - When a new change is detected, we start a new generation, invalidating all pending ops
 * - Operations from stale generations are ignored when they complete
 * - Only when all operations for the CURRENT generation complete do we trigger a sync
 */
export class OperationTracker {
  private pendingOperations = new Map<string, number>();
  private currentGeneration = 0;

  /**
   * Starts a new generation, clearing all pending operations.
   * Call this when a new file change is detected to cancel any in-progress work.
   * @returns The new generation number
   */
  startNewGeneration(): number {
    this.currentGeneration++;
    this.pendingOperations.clear();

    return this.currentGeneration;
  }

  /**
   * Adds a pending operation for the current generation.
   * @param id - Unique identifier for the operation (e.g., 'manifestBuild' or 'buildBatch')
   */
  addPending(id: string): void {
    this.pendingOperations.set(id, this.currentGeneration);
  }

  /**
   * Marks an operation as complete.
   * @param id - The operation identifier
   * @param generation - The generation when this operation started
   * @returns true if the operation was current and removed, false if stale (ignored)
   */
  markComplete(id: string, generation: number): boolean {
    // Ignore completions from stale generations
    if (generation !== this.currentGeneration) {
      return false;
    }

    const opGeneration = this.pendingOperations.get(id);

    if (opGeneration === undefined) {
      // Operation wasn't tracked or already completed
      return false;
    }

    if (opGeneration !== generation) {
      // Operation belongs to a different generation
      return false;
    }

    this.pendingOperations.delete(id);

    return true;
  }

  /**
   * Checks if all pending operations for the current generation have completed.
   * @returns true if no pending operations remain
   */
  isEmpty(): boolean {
    return this.pendingOperations.size === 0;
  }

  /**
   * Gets the current generation number.
   * @returns The current generation
   */
  getCurrentGeneration(): number {
    return this.currentGeneration;
  }

  /**
   * Gets the count of pending operations.
   * @returns Number of pending operations
   */
  getPendingCount(): number {
    return this.pendingOperations.size;
  }

  /**
   * Gets the list of pending operation IDs.
   * Useful for debugging.
   * @returns Array of pending operation IDs
   */
  getPendingIds(): string[] {
    return Array.from(this.pendingOperations.keys());
  }
}
