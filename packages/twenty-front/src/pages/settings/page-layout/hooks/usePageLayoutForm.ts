import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo } from 'react';
import { type Layout, type Layouts } from 'react-grid-layout';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { type Widget } from '../mocks/mockWidgets';
import {
  savedPageLayoutsState,
  type SavedPageLayout,
} from '../states/savedPageLayoutsState';

const pageLayoutFormSchema = z.object({
  name: z.string().min(1, 'Layout name is required'),
  type: z.enum(['DASHBOARD', 'RECORD_INDEX', 'RECORD_PAGE']),
  widgets: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      type: z.enum(['VIEW', 'IFRAME', 'FIELDS', 'GRAPH']),
      graphType: z.enum(['number', 'gauge', 'pie', 'bar', 'line']).optional(),
      gridPosition: z.object({
        row: z.number(),
        column: z.number(),
        rowSpan: z.number(),
        columnSpan: z.number(),
      }),
      configuration: z.record(z.unknown()).optional(),
      data: z.any().optional(),
    }),
  ),
});

export type PageLayoutFormData = z.infer<typeof pageLayoutFormSchema>;

export const usePageLayoutForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id && id !== 'new';

  const [savedPageLayouts, setSavedPageLayouts] = useRecoilState(
    savedPageLayoutsState,
  );

  const existingLayout = useMemo(
    () => (isEditMode ? savedPageLayouts.find((l) => l.id === id) : null),
    [isEditMode, id, savedPageLayouts],
  );

  const formMethods = useForm<PageLayoutFormData>({
    mode: 'onChange',
    resolver: zodResolver(pageLayoutFormSchema),
    defaultValues: existingLayout
      ? {
          name: existingLayout.name,
          type: existingLayout.type,
          widgets: existingLayout.widgets,
        }
      : {
          name: '',
          type: 'DASHBOARD',
          widgets: [],
        },
  });

  const { handleSubmit, formState, watch, setValue, getValues } = formMethods;

  const watchedValues = watch();

  const convertLayoutsToWidgets = useCallback(
    (widgets: Widget[], layouts: Layouts): PageLayoutFormData['widgets'] => {
      const lgLayouts = layouts.lg || [];
      return widgets.map((widget) => {
        const layout = lgLayouts.find((l) => l.i === widget.id);
        return {
          ...widget,
          gridPosition: {
            row: layout?.y || 0,
            column: layout?.x || 0,
            rowSpan: layout?.h || 2,
            columnSpan: layout?.w || 2,
          },
        };
      });
    },
    [],
  );

  const convertWidgetsToLayouts = useCallback(
    (widgets: PageLayoutFormData['widgets']): Layouts => {
      const layouts = widgets.map((w) => ({
        i: w.id,
        x: w.gridPosition.column,
        y: w.gridPosition.row,
        w: w.gridPosition.columnSpan,
        h: w.gridPosition.rowSpan,
      }));
      return {
        lg: layouts,
        md: layouts,
        sm: layouts.map((l) => ({ ...l, w: 1, x: 0 })),
      };
    },
    [],
  );

  const handleSave = useCallback(
    async (formData: PageLayoutFormData) => {
      const layoutToSave: SavedPageLayout = {
        id: isEditMode ? id : uuidv4(),
        name: formData.name,
        type: formData.type,
        createdAt: isEditMode
          ? existingLayout?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        widgets: formData.widgets,
      };

      if (isDefined(isEditMode)) {
        setSavedPageLayouts((prev) =>
          prev.map((layout) => (layout.id === id ? layoutToSave : layout)),
        );
      } else {
        setSavedPageLayouts((prev) => [...prev, layoutToSave]);
      }

      navigate('/settings/page-layout');
    },
    [isEditMode, id, existingLayout?.createdAt, setSavedPageLayouts, navigate],
  );

  const updateWidgetsFromLayouts = useCallback(
    (layouts: Layouts) => {
      const currentWidgets = getValues('widgets');
      const widgetData = currentWidgets.map((w) => ({
        id: w.id,
        title: w.title,
        type: w.type,
        graphType: w.graphType,
        data: w.data,
      })) as Widget[];
      const updatedWidgets = convertLayoutsToWidgets(widgetData, layouts);
      setValue('widgets', updatedWidgets);
    },
    [convertLayoutsToWidgets, setValue, getValues],
  );

  const addWidget = useCallback(
    (widget: Widget, layout: Layout) => {
      const currentWidgets = getValues('widgets');
      const newWidget = {
        ...widget,
        gridPosition: {
          row: layout.y,
          column: layout.x,
          rowSpan: layout.h,
          columnSpan: layout.w,
        },
      };
      setValue('widgets', [...currentWidgets, newWidget]);
    },
    [getValues, setValue],
  );

  const removeWidget = useCallback(
    (widgetId: string) => {
      const currentWidgets = getValues('widgets');
      setValue(
        'widgets',
        currentWidgets.filter((w) => w.id !== widgetId),
      );
    },
    [getValues, setValue],
  );

  const canSave =
    watchedValues.name?.trim().length > 0 && !formState.isSubmitting;

  return {
    formMethods,
    handleSave,
    handleSubmit,
    canSave,
    isSubmitting: formState.isSubmitting,
    isEditMode,
    existingLayout,
    convertWidgetsToLayouts,
    updateWidgetsFromLayouts,
    addWidget,
    removeWidget,
    watchedValues,
  };
};
