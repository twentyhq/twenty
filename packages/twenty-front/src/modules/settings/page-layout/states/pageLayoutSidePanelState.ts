import { atom } from 'recoil';
import { type WidgetType } from '../mocks/mockWidgets';

export enum SidePanelStep {
  SELECT_WIDGET_TYPE = 'select-widget-type',
  SELECT_GRAPH_TYPE = 'select-graph-type',
}

export const sidePanelStepState = atom<SidePanelStep>({
  key: 'sidePanelStepState',
  default: SidePanelStep.SELECT_WIDGET_TYPE,
});

export const selectedWidgetTypeState = atom<WidgetType | null>({
  key: 'selectedWidgetTypeState',
  default: null,
});

// Helper functions for step navigation
export const canGoBack = (currentStep: SidePanelStep): boolean => {
  return currentStep === SidePanelStep.SELECT_GRAPH_TYPE;
};

export const getStepTitle = (currentStep: SidePanelStep): string => {
  switch (currentStep) {
    case SidePanelStep.SELECT_WIDGET_TYPE:
      return 'New Widget';
    case SidePanelStep.SELECT_GRAPH_TYPE:
      return 'Select Graph Type';
    default:
      return '';
  }
};
