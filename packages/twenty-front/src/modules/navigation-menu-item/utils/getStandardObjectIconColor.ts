import type { ThemeColor } from 'twenty-ui/theme';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

const STANDARD_OBJECT_ICON_COLOR: Partial<
  Record<CoreObjectNameSingular, ThemeColor>
> = {
  [CoreObjectNameSingular.Company]: 'blue',
  [CoreObjectNameSingular.Person]: 'blue',
  [CoreObjectNameSingular.Task]: 'turquoise',
  [CoreObjectNameSingular.TaskTarget]: 'turquoise',
  [CoreObjectNameSingular.Note]: 'turquoise',
  [CoreObjectNameSingular.NoteTarget]: 'turquoise',
  [CoreObjectNameSingular.Opportunity]: 'tomato',
  [CoreObjectNameSingular.Dashboard]: 'gray',
  [CoreObjectNameSingular.Workflow]: 'gray',
  [CoreObjectNameSingular.WorkflowRun]: 'gray',
  [CoreObjectNameSingular.WorkflowVersion]: 'gray',
};

export const getStandardObjectIconColor = (
  nameSingular: string,
): ThemeColor | undefined =>
  STANDARD_OBJECT_ICON_COLOR[nameSingular as CoreObjectNameSingular];
