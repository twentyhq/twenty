import { createState } from 'twenty-ui/utilities';
import { type WidgetType } from '../mocks/mockWidgets';

export enum SidePanelStep {
  SELECT_WIDGET_TYPE = 'select-widget-type',
  SELECT_GRAPH_TYPE = 'select-graph-type',
}

export const sidePanelStepState = createState<SidePanelStep>({
  key: 'sidePanelStepState',
  defaultValue: SidePanelStep.SELECT_WIDGET_TYPE,
});

export const selectedWidgetTypeState = createState<WidgetType | null>({
  key: 'selectedWidgetTypeState',
  defaultValue: null,
});
