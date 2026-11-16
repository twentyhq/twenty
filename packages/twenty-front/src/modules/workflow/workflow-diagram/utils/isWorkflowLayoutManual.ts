import { getFlowPositions } from '@/workflow/utils/getFlowPositions';
import { isDefined } from 'twenty-shared/utils';

export const isWorkflowLayoutManual = (
  flow: Parameters<typeof getFlowPositions>[0],
): boolean =>
  getFlowPositions(flow).some(({ position }) => isDefined(position));
