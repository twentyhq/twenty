import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';
import { savedPageLayoutsState } from '../states/savedPageLayoutsState';

const pageLayoutFormSchema = z.object({
  name: z.string().min(1, 'Layout name is required'),
  type: z.enum(['DASHBOARD', 'RECORD_INDEX', 'RECORD_PAGE']),
  widgets: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      type: z.enum(['VIEW', 'IFRAME', 'FIELDS', 'GRAPH']),
      graphType: z.enum(['number', 'gauge', 'pie', 'bar']).optional(),
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

export const usePageLayoutFormState = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = id && id !== 'new';
  const savedPageLayouts = useRecoilValue(savedPageLayoutsState);

  const existingLayout = useMemo(() => {
    if (isDefined(isEditMode)) {
      return savedPageLayouts.find((layout) => layout.id === id);
    }
    return undefined;
  }, [isEditMode, id, savedPageLayouts]);

  const formMethods = useForm<PageLayoutFormData>({
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

  const watchedValues = formMethods.watch();
  const canSave =
    watchedValues.name?.trim().length > 0 &&
    !formMethods.formState.isSubmitting;

  return {
    formMethods,
    isEditMode,
    existingLayout,
    watchedValues,
    canSave,
  };
};
