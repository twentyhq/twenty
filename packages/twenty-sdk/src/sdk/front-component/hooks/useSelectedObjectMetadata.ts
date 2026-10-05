import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { type FrontComponentSelectedObjectMetadata } from '../types/FrontComponentSelectedObjectMetadata';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectSelectedObjectMetadata = (
  context: FrontComponentExecutionContext,
): FrontComponentSelectedObjectMetadata | null =>
  context.selectedObjectMetadata ?? null;

export const useSelectedObjectMetadata =
  (): FrontComponentSelectedObjectMetadata | null => {
    return useFrontComponentExecutionContext(selectSelectedObjectMetadata);
  };
