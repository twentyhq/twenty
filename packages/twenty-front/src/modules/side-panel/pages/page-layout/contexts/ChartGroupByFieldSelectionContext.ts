import { type useChartGroupByFieldSelection } from '@/side-panel/pages/page-layout/hooks/useChartGroupByFieldSelection';
import { createContext } from 'react';

export const ChartGroupByFieldSelectionContext =
  createContext<ReturnType<typeof useChartGroupByFieldSelection>>(null);
